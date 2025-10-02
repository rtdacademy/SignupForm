import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDatabase, ref, get, set, serverTimestamp } from 'firebase/database';
import { toast } from 'sonner';
import {
  getNextSchoolYear,
  getRegistrationPhase,
  formatImportantDate
} from '../config/calendarConfig';
import {
  getFacilitatorByEmail
} from '../config/facilitators';
import {
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  Users,
  GraduationCap,
  Loader2,
  Calendar,
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';

/**
 * IntentToRegisterForm Component
 *
 * Allows families to submit their intent to register for the next school year
 * after the current year's September count has passed but before next year's
 * registration officially opens.
 *
 * This form:
 * - Captures family commitment for next school year
 * - Allows selection of facilitators who accept intent registrations
 * - Stores data separately from official notification forms
 * - Provides clear disclaimers about provisional status
 */
const IntentToRegisterForm = ({ familyData, onComplete }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingIntent, setExistingIntent] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [acknowledgedMustRegister, setAcknowledgedMustRegister] = useState(false);

  const nextSchoolYear = getNextSchoolYear();
  const registrationPhase = getRegistrationPhase();

  // Get facilitator from family data
  const assignedFacilitator = familyData?.facilitatorEmail
    ? getFacilitatorByEmail(familyData.facilitatorEmail)
    : null;

  // Load existing intent form if one exists
  useEffect(() => {
    const loadExistingIntent = async () => {
      if (!currentUser || !familyData?.familyId) return;

      setLoading(true);
      try {
        const db = getDatabase();
        const schoolYearPath = nextSchoolYear.replace('/', '_');
        const intentRef = ref(db, `homeEducationFamilies/familyInformation/${familyData.familyId}/INTENT_REGISTRATIONS/${schoolYearPath}`);
        const snapshot = await get(intentRef);

        // Get student IDs from students array (familyData.students is an array from Dashboard)
        const studentIds = Array.isArray(familyData?.students)
          ? familyData.students.map(s => s.id)
          : (familyData?.students ? Object.keys(familyData.students) : []);

        if (snapshot.exists()) {
          const intentData = snapshot.val();
          // Store the full intent data object (keyed by studentId)
          setExistingIntent(intentData);

          // Intent data is per-student, so check which students have intents
          const studentsWithIntent = [];
          Object.keys(intentData).forEach(studentId => {
            if (intentData[studentId]?.intentSubmitted) {
              studentsWithIntent.push(studentId);
            }
          });

          if (studentsWithIntent.length > 0) {
            setAcknowledgedMustRegister(true);
          }

          // Pre-select all students (both existing and new)
          setSelectedStudents(studentIds);
        } else {
          // No existing intent - pre-select all students by default
          setSelectedStudents(studentIds);
        }
      } catch (error) {
        console.error('Error loading intent form:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExistingIntent();
  }, [currentUser, familyData, nextSchoolYear]);

  // Get list of students from family data
  const students = React.useMemo(() => {
    if (!familyData?.students) return [];
    return Object.entries(familyData.students).map(([id, student]) => ({
      id,
      ...student
    }));
  }, [familyData]);

  // Toggle student selection
  const toggleStudent = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      selectedStudents.length > 0 &&
      acknowledgedMustRegister
    );
  };

  // Submit intent form
  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast.error('Please complete all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const db = getDatabase();
      const schoolYearPath = nextSchoolYear.replace('/', '_');

      // Submit intent for each selected student
      const promises = selectedStudents.map(async (studentId) => {
        const student = students.find(s => s.id === studentId);

        if (!student) {
          console.error('Student not found:', studentId, 'Available students:', students);
          throw new Error(`Student with ID ${studentId} not found`);
        }

        const intentRef = ref(db, `homeEducationFamilies/familyInformation/${familyData.familyId}/INTENT_REGISTRATIONS/${schoolYearPath}/${studentId}`);

        const intentData = {
          intentSubmitted: true,
          submittedAt: Date.now(),
          submittedBy: currentUser.uid,
          status: 'intent-submitted',
          facilitatorId: assignedFacilitator?.id || null,
          facilitatorName: assignedFacilitator?.name || '',
          facilitatorEmail: familyData.facilitatorEmail,
          schoolYear: nextSchoolYear,
          schoolYearDisplay: registrationPhase.targetYear,
          acknowledgedMustRegister: true,
          studentInfo: {
            firstName: student.firstName,
            lastName: student.lastName,
            asn: student.asn,
            grade: student.grade
          },
          familyId: familyData.familyId,
          updatedAt: Date.now()
        };

        await set(intentRef, intentData);
      });

      await Promise.all(promises);

      // Update family status from 'intent-pending' to 'intent'
      const familyStatusRef = ref(db, `homeEducationFamilies/familyInformation/${familyData.familyId}/status`);
      await set(familyStatusRef, 'intent');

      setExistingIntent({ intentSubmitted: true });

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error submitting intent form:', error);
      toast.error('Failed to submit intent form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    );
  }

  // Allow intent families to always see this form
  // (The dashboard will only show this for families with status: 'intent')

  return (
    <div className="space-y-6">
      {/* Header Information */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-start space-x-3">
            <FileText className="w-6 h-6 text-blue-600 mt-1" />
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">Intent to Register for {nextSchoolYear}</CardTitle>
              <CardDescription className="text-sm text-gray-700">
                Submit your intent to register for the {nextSchoolYear} school year. This provisional enrollment
                secures your spot with a facilitator. You'll need to complete the official registration forms
                when they open on {registrationPhase.nextRegistrationDate && formatImportantDate(registrationPhase.nextRegistrationDate)}.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Existing Submission Notice */}
      {existingIntent && (() => {
        const studentsWithIntent = Object.keys(existingIntent).filter(
          studentId => existingIntent[studentId]?.intentSubmitted
        );
        const allStudentIds = familyData?.students ? Object.keys(familyData.students) : [];
        const newStudents = allStudentIds.filter(id => !studentsWithIntent.includes(id));
        const hasNewStudents = newStudents.length > 0;

        return (
          <>
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-900">Intent Already Submitted</AlertTitle>
              <AlertDescription className="text-green-800">
                Intent to register has been submitted for {studentsWithIntent.length} student{studentsWithIntent.length !== 1 ? 's' : ''}.
                You can update your selections below if needed.
              </AlertDescription>
            </Alert>

            {hasNewStudents && (
              <Alert className="border-orange-300 bg-orange-50">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <AlertTitle className="text-orange-900 font-semibold">New Student(s) Detected!</AlertTitle>
                <AlertDescription className="text-orange-800">
                  You have added {newStudents.length} new student{newStudents.length !== 1 ? 's' : ''} since your last submission.
                  Please review and ensure all students are selected below, then resubmit to update your intent.
                </AlertDescription>
              </Alert>
            )}
          </>
        );
      })()}

      {/* Important Information */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-1" />
            <div>
              <CardTitle className="text-base text-yellow-900">Important Information</CardTitle>
              <ul className="mt-2 space-y-2 text-sm text-yellow-800">
                <li className="flex items-start">
                  <Clock className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>This is <strong>NOT</strong> official registration for the {nextSchoolYear} school year</span>
                </li>
                <li className="flex items-start">
                  <Calendar className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Official registration opens: {registrationPhase.nextRegistrationDate && formatImportantDate(registrationPhase.nextRegistrationDate)}</span>
                </li>
                <li className="flex items-start">
                  <Users className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>This secures your provisional spot with a facilitator for next year</span>
                </li>
              </ul>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Form Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Registration Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Family Information (Read-only) */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Family Information
            </h4>
            <div className="space-y-1 text-sm text-gray-700">
              <p><strong>Family Name:</strong> {familyData?.familyName || 'N/A'}</p>
              <p><strong>Email:</strong> {currentUser?.email}</p>
            </div>
          </div>

          {/* Student Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center">
              <GraduationCap className="w-4 h-4 mr-2" />
              Select Students to Register *
            </Label>
            {students.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No students found. Please add students to your family profile first.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                {students.map(student => {
                  const hasExistingIntent = existingIntent && Object.keys(existingIntent).includes(student.id);
                  const isNewStudent = !hasExistingIntent && existingIntent !== null;

                  return (
                    <div
                      key={student.id}
                      className={`flex items-center space-x-3 p-3 border rounded-lg transition-all ${
                        isNewStudent
                          ? 'border-orange-300 bg-orange-50 ring-2 ring-orange-200'
                          : hasExistingIntent
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Checkbox
                        id={`student-${student.id}`}
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={() => toggleStudent(student.id)}
                      />
                      <Label
                        htmlFor={`student-${student.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{student.firstName} {student.lastName}</span>
                          {hasExistingIntent && (
                            <span className="inline-flex items-center text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-300">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Intent Submitted
                            </span>
                          )}
                          {isNewStudent && (
                            <span className="inline-flex items-center text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full border border-orange-300 animate-pulse">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              New Student
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">Grade: {student.grade || 'Not specified'}</div>
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Assigned Facilitator Display */}
          {assignedFacilitator && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-2 border-purple-200">
              <Label className="text-base font-semibold flex items-center mb-3">
                <Users className="w-4 h-4 mr-2" />
                Your Assigned Facilitator
              </Label>
              <div className="flex items-center space-x-4">
                <img
                  src={assignedFacilitator.image}
                  alt={assignedFacilitator.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-purple-300"
                />
                <div>
                  <p className="font-semibold text-lg text-gray-900">{assignedFacilitator.name}</p>
                  <p className="text-sm text-gray-600">{assignedFacilitator.title}</p>
                </div>
              </div>
            </div>
          )}

          {/* Acknowledgment */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-semibold">Required Acknowledgment *</h4>

            <div className="flex items-start space-x-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <Checkbox
                id="ack-must-register"
                checked={acknowledgedMustRegister}
                onCheckedChange={setAcknowledgedMustRegister}
                className="mt-1"
              />
              <Label htmlFor="ack-must-register" className="text-sm cursor-pointer font-medium text-gray-900">
                I understand that I must complete the official Home Education Notification Form when registration opens on January 1, 2026.
              </Label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid() || submitting}
              className="w-full sm:w-auto"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : existingIntent ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Intent to Register
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Submit Intent to Register
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      {existingIntent && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-base">Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5" />
              <span>Your intent has been recorded</span>
            </div>
            <div className="flex items-start space-x-2">
              <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
              <span>We'll contact you when registration opens on {registrationPhase.nextRegistrationDate && formatImportantDate(registrationPhase.nextRegistrationDate)}</span>
            </div>
            <div className="flex items-start space-x-2">
              <FileText className="w-4 h-4 text-blue-600 mt-0.5" />
              <span>Continue preparing: upload citizenship documents and explore our portfolio system</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Helper to get current school year (imported from config but needed for acknowledgment text)
const getCurrentSchoolYear = () => {
  const { schoolYear } = getRegistrationPhase();
  return schoolYear;
};

export default IntentToRegisterForm;