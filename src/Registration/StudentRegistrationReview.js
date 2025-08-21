import React from 'react';
import { Card, CardContent } from "../components/ui/card";
import { Loader2, InfoIcon, FileText, Eye, ExternalLink } from "lucide-react";
import { getDatabase, ref, get } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

// Utility function to determine if school selection should be shown
const shouldShowSchoolSelection = (studentType) => {
  return (
    studentType === 'Non-Primary' ||
    studentType === 'Home Education' ||
    studentType === 'Summer School'
  );
};

const ReviewSection = ({ title, items, children }) => (
  <div className="space-y-3">
    <h3 className="font-semibold text-lg">{title}</h3>
    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
      {items.map(
        ([label, value]) =>
          value && (
            <div key={label} className="space-y-1">
              <dt className="text-sm font-medium text-gray-500">{label}</dt>
              <dd className="text-sm">{value}</dd>
            </div>
          )
      )}
    </dl>
    {children}
  </div>
);

// Document Preview Component
const DocumentPreview = ({ documents, title }) => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  if (!documents || (Array.isArray(documents) && documents.length === 0)) {
    return null;
  }

  // Convert old format to array format for consistent handling
  const documentArray = Array.isArray(documents) ? documents : [];

  const handlePreview = (doc) => {
    setSelectedDocument(doc);
    setShowPreview(true);
  };


  const getFileType = (url) => {
    if (!url) return 'unknown';
    const extension = url.split('.').pop().toLowerCase().split('?')[0];
    return extension;
  };

  return (
    <>
      <div className="mt-2 space-y-2">
        <p className="text-sm font-medium text-gray-600">{title}:</p>
        <div className="space-y-1">
          {documentArray.map((doc, index) => {
            const fileType = getFileType(doc.url);
            const isPDF = fileType === 'pdf';
            
            return (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {doc.typeLabel || doc.type || `Document ${index + 1}`}
                  </span>
                  {doc.name && (
                    <span className="text-xs text-gray-500">({doc.name})</span>
                  )}
                </div>
                <div className="flex gap-2">
                  {isPDF ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(doc.url, '_blank')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreview(doc)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {selectedDocument?.typeLabel || selectedDocument?.type || 'Document Preview'}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[calc(90vh-100px)]">
            {selectedDocument && (
              <img
                src={selectedDocument.url}
                alt={selectedDocument.name || 'Document'}
                className="w-full h-auto"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const StudentRegistrationReview = ({ onBack, requiredCourses = [], loadingRequiredCourses = false, transitionCourse }) => {
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
  const isInternationalStudent = formData.studentType === 'International Student';

  // Create name display that handles preferred names for both student types
  const nameDisplay =
    formData.preferredFirstName && formData.preferredFirstName !== formData.firstName
      ? `${formData.firstName} ${formData.lastName} (Preferred: ${formData.preferredFirstName})`
      : `${formData.firstName} ${formData.lastName}`;

  // Determine ASN display message
  const asnDisplay = formData.albertaStudentNumber
    ? formData.albertaStudentNumber
    : formData.needsASNCreation
    ? "RTD Academy will create your K-12 ASN and email it to you"
    : "Will be generated when you are added to Alberta's PASI system";

  const personalInfo = [
    ['Name', nameDisplay],
    ['Email', user.email],
    ['Phone', formData.phoneNumber],
    ['Address', formData.address?.fullAddress || ''],
    ['Birthday', formData.birthday],
    ['Age', formData.age ? `${formData.age} years old` : ''],
    ['Gender', formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) : ''],
    ['Alberta Student Number', asnDisplay],
    ['Student Photo', formData.studentPhoto ? 'Uploaded' : 'Not uploaded'],
    // Show school information for appropriate student types
    ...(shouldShowSchoolSelection(formData.studentType)
      ? [
          ['Current School', formData.schoolAddress?.name || formData.currentSchool],
          ['School Address', formData.schoolAddress?.fullAddress],
        ]
      : []),
  ];

  // Handle parent information differently based on student type
  const shouldShowParentInfo = isAdultStudent
    ? Boolean(formData.parentFirstName) // Only show if provided for adult students
    : true; // Always show for non-primary students

  const parentInfo = [
    ['Parent First Name', formData.parentFirstName],
    ['Parent Last Name', formData.parentLastName],
    ['Parent Phone', formData.parentPhone],
    ['Parent Email', formData.parentEmail],
    ...(formData.parentRelationship ? [
      ['Relationship', formData.parentRelationship.charAt(0).toUpperCase() + formData.parentRelationship.slice(1)]
    ] : []),
    ...(formData.parentRelationship && formData.parentRelationship !== 'parent' ? [
      ['Legal Guardian', formData.isLegalGuardian ? 'Yes' : 'No']
    ] : []),
  ];

  const courseInfo = [
    ['Student Type', formData.studentType],
    ['School Year', formData.enrollmentYear],
    ['Term', formData.term || 'Full Year'],
    ['Course', formData.courseName],
    ['Start Date', formData.startDate],
    ['End Date', formData.endDate],
    // Only show diploma date if it exists
    ...(formData.diplomaMonth?.displayDate
      ? [['Diploma Date', formData.diplomaMonth.displayDate]]
      : []),
  ];

  // Handle international student documents
  const getInternationalDocumentCount = () => {
    // Check new array format first
    if (formData.internationalDocuments && Array.isArray(formData.internationalDocuments)) {
      return formData.internationalDocuments.length;
    }
    // Check old object format
    if (formData.documents) {
      let count = 0;
      if (formData.documents.passport) count++;
      if (formData.documents.additionalID) count++;
      if (formData.documents.residencyProof) count++;
      return count;
    }
    return 0;
  };

  // International student information
  const internationalInfo = isInternationalStudent
    ? [
        ['Identification Documents', `${getInternationalDocumentCount()} document(s) uploaded`],
      ]
    : [];

  // Residency and identification information
  const residencyInfo = [
    ...(formData.studentType !== 'International Student' ? [
      ['Alberta Resident', formData.albertaResident === true || formData.albertaResident === 'yes' ? 'Yes' : 'No'],
    ] : []),
    ['Indigenous Identification', 
      formData.indigenousIdentification === 'yes' ? 'Yes' : 
      formData.indigenousIdentification === 'no' ? 'No' : 
      formData.indigenousIdentification === 'unsure' ? 'Prefer not to answer' : ''],
    ...(formData.indigenousIdentification === 'yes' && formData.indigenousStatus ? [
      ['Indigenous Status', formData.indigenousStatus],
    ] : []),
  ];

  // Citizenship documentation (for non-international students)
  const citizenshipInfo = !isInternationalStudent && formData.citizenshipDocuments && formData.citizenshipDocuments.length > 0
    ? [['Citizenship Documents', `${formData.citizenshipDocuments.length} document(s) uploaded`]]
    : [];

  // Format "how did you hear about us" option
  const formatHowDidYouHear = (value) => {
    if (!value) return '';
    
    const mappings = {
      'google-search': 'Google Search',
      'online-ad': 'Online Advertising (Google Ads, etc.)',
      'social-media': 'Social Media (Facebook, Instagram, etc.)',
      'friend-referral': 'Friend or Family Referral',
      'school-counselor': 'School Counselor',
      'teacher': 'Teacher Recommendation',
      'radio-ad': 'Radio Advertisement',
      'newspaper': 'Newspaper',
      'school-website': 'School Website',
      'education-fair': 'Education Fair/Event',
      'other': 'Other'
    };
    
    return mappings[value] || value;
  };

  // Survey information
  const surveyInfo = [
    ['How did you hear about us?', formatHowDidYouHear(formData.howDidYouHear)],
    ...(formData.whyApplying ? [['Why are you applying?', formData.whyApplying]] : []),
  ];

  // Render required courses section if there are any
  const renderRequiredCourses = () => {
    if (loadingRequiredCourses) {
      return (
        <div className="flex items-center space-x-2 text-sm text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading required courses...</span>
        </div>
      );
    }

    if (requiredCourses.length === 0) {
      return null;
    }

    return (
      <Alert className="bg-blue-50 border-blue-200 mb-4">
        <InfoIcon className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700">
          <p className="font-medium mb-2">Required Courses</p>
          <p className="text-sm mb-2">
            You will also be automatically enrolled in the following required course(s):
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            {requiredCourses.map(course => (
              <li key={course.id}>
                {course.title}
                {course.hasAllowedEmails && (
                  <span className="ml-1 text-xs text-blue-600">(Selected for your account)</span>
                )}
              </li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="space-y-8">
      {/* Show transition context if applicable */}
      {transitionCourse && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2">
              <InfoIcon className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-orange-800 mb-2">Course Transition Re-registration</h3>
                <div className="text-sm text-orange-700 space-y-1">
                  <p>You are re-registering for <strong>{transitionCourse.courseName}</strong> to continue into the next school year.</p>
                  {transitionCourse.currentStudentType && formData.studentType !== transitionCourse.currentStudentType && (
                    <p className="mt-2">
                      Student type changed from <strong>{transitionCourse.currentStudentType}</strong> to <strong>{formData.studentType}</strong>
                    </p>
                  )}
                  <p className="text-xs mt-2 text-orange-600">
                    Your previous enrollment data and progress will be preserved.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-6 pt-6">
          <ReviewSection title="Personal Information" items={personalInfo} />

          {isInternationalStudent && (
            <ReviewSection
              title="International Student Information"
              items={internationalInfo}
            >
              {/* Document preview for international students */}
              {formData.internationalDocuments && formData.internationalDocuments.length > 0 && (
                <DocumentPreview 
                  documents={formData.internationalDocuments} 
                  title="Uploaded Documents"
                />
              )}
            </ReviewSection>
          )}

          {shouldShowParentInfo && (
            <ReviewSection
              title={
                isAdultStudent
                  ? 'Parent/Guardian Information (Optional)'
                  : 'Parent/Guardian Information'
              }
              items={parentInfo}
            >
              {!isAdultStudent && formData.age < 18 && formData.parentEmail && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-md p-3">
                  <div className="flex items-start">
                    <InfoIcon className="h-4 w-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="text-amber-800 font-medium">Parent Permission Required</p>
                      <p className="text-amber-700 mt-1">
                        An email will be sent to {formData.parentEmail} requesting permission for you to enroll. 
                        You can start the course immediately, but parent approval is required before you're added to the Alberta Education system.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </ReviewSection>
          )}

          <ReviewSection title="Course Information" items={courseInfo} />

          {renderRequiredCourses()}

          {residencyInfo.filter(([_, value]) => value).length > 0 && (
            <ReviewSection title="Residency & Identification" items={residencyInfo} />
          )}

          {citizenshipInfo.length > 0 && (
            <ReviewSection title="Citizenship Documentation" items={citizenshipInfo}>
              {/* Document preview for citizenship documents */}
              {formData.citizenshipDocuments && formData.citizenshipDocuments.length > 0 && (
                <DocumentPreview 
                  documents={formData.citizenshipDocuments} 
                  title="Uploaded Documents"
                />
              )}
            </ReviewSection>
          )}

          <ReviewSection title="Survey Information" items={surveyInfo} />

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