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
  getIntentAvailableFacilitators,
  getFacilitatorDropdownOptionsByType
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';

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
  const [selectedFacilitator, setSelectedFacilitator] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [notes, setNotes] = useState('');
  const [acknowledgedNotFunded, setAcknowledgedNotFunded] = useState(false);
  const [acknowledgedProvisional, setAcknowledgedProvisional] = useState(false);
  const [acknowledgedMustRegister, setAcknowledgedMustRegister] = useState(false);

  const nextSchoolYear = getNextSchoolYear();
  const registrationPhase = getRegistrationPhase();
  const availableFacilitators = getFacilitatorDropdownOptionsByType('intent');

  // Load existing intent form if one exists
  useEffect(() => {
    const loadExistingIntent = async () => {
      if (!currentUser || !familyData?.familyId) return;

      setLoading(true);
      try {
        const db = getDatabase();
        const intentRef = ref(db, `rtdConnect/families/${familyData.familyId}/intentToRegister/${nextSchoolYear.replace('/', '-')}`);
        const snapshot = await get(intentRef);

        if (snapshot.exists()) {
          const intentData = snapshot.val();
          setExistingIntent(intentData);
          setSelectedFacilitator(intentData.facilitatorName || '');
          setSelectedStudents(intentData.students || []);
          setNotes(intentData.notes || '');
          setAcknowledgedNotFunded(true);
          setAcknowledgedProvisional(true);
          setAcknowledgedMustRegister(true);
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
      selectedFacilitator &&
      selectedStudents.length > 0 &&
      acknowledgedNotFunded &&
      acknowledgedProvisional &&
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
      const schoolYearPath = nextSchoolYear.replace('/', '-');
      const intentRef = ref(db, `rtdConnect/families/${familyData.familyId}/intentToRegister/${schoolYearPath}`);

      // Get facilitator details
      const selectedFacilitatorOption = availableFacilitators.find(
        f => f.value === selectedFacilitator
      );

      const intentData = {
        facilitatorId: selectedFacilitatorOption?.facilitatorId || null,
        facilitatorName: selectedFacilitator,
        students: selectedStudents,
        schoolYear: nextSchoolYear,
        schoolYearDisplay: registrationPhase.targetYear,
        submittedDate: serverTimestamp(),
        submittedBy: currentUser.uid,
        submittedByEmail: currentUser.email,
        status: 'pending',
        acknowledgedNotFunded: true,
        acknowledgedProvisional: true,
        acknowledgedMustRegister: true,
        notes: notes || '',
        familyId: familyData.familyId,
        familyLastName: familyData.parentLastName || '',
        updatedAt: serverTimestamp()
      };

      await set(intentRef, intentData);

      setExistingIntent(intentData);
      toast.success('Intent to Register submitted successfully!');

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

  // Check if we're in the intent period
  if (registrationPhase.phase !== 'intent-period') {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Intent to Register Not Available</AlertTitle>
        <AlertDescription>
          Intent to Register is only available between the September count date and the next year's registration opening date.
        </AlertDescription>
      </Alert>
    );
  }

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
      {existingIntent && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900">Intent Already Submitted</AlertTitle>
          <AlertDescription className="text-green-800">
            You submitted your intent to register on {existingIntent.submittedDate && new Date(existingIntent.submittedDate).toLocaleDateString()}.
            You can update your selections below if needed.
          </AlertDescription>
        </Alert>
      )}

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
              <p><strong>Family Name:</strong> {familyData?.parentLastName || 'N/A'}</p>
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
                {students.map(student => (
                  <div key={student.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <Checkbox
                      id={`student-${student.id}`}
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => toggleStudent(student.id)}
                    />
                    <Label
                      htmlFor={`student-${student.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">{student.firstName} {student.lastName}</div>
                      <div className="text-sm text-gray-500">Grade: {student.grade || 'Not specified'}</div>
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Facilitator Selection */}
          <div className="space-y-3">
            <Label htmlFor="facilitator" className="text-base font-semibold">
              Select Facilitator *
            </Label>
            <Select value={selectedFacilitator} onValueChange={setSelectedFacilitator}>
              <SelectTrigger id="facilitator">
                <SelectValue placeholder="Choose a facilitator" />
              </SelectTrigger>
              <SelectContent>
                {availableFacilitators.map((facilitator) => (
                  <SelectItem key={facilitator.value} value={facilitator.value}>
                    {facilitator.label}
                    {facilitator.description && ` - ${facilitator.description}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableFacilitators.length <= 1 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No facilitators are currently accepting intent registrations. Please check back later.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Additional Notes */}
          <div className="space-y-3">
            <Label htmlFor="notes" className="text-base font-semibold">
              Additional Notes or Requests (Optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests or information you'd like to share..."
              rows={4}
            />
          </div>

          {/* Acknowledgments */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-semibold">Required Acknowledgments *</h4>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="ack-not-funded"
                checked={acknowledgedNotFunded}
                onCheckedChange={setAcknowledgedNotFunded}
              />
              <Label htmlFor="ack-not-funded" className="text-sm cursor-pointer">
                I understand that this is NOT official registration and I will NOT receive funding for the current {getCurrentSchoolYear()} school year.
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="ack-provisional"
                checked={acknowledgedProvisional}
                onCheckedChange={setAcknowledgedProvisional}
              />
              <Label htmlFor="ack-provisional" className="text-sm cursor-pointer">
                I understand that this is a provisional enrollment for the {nextSchoolYear} school year and my facilitator placement may be subject to availability.
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="ack-must-register"
                checked={acknowledgedMustRegister}
                onCheckedChange={setAcknowledgedMustRegister}
              />
              <Label htmlFor="ack-must-register" className="text-sm cursor-pointer">
                I understand that I must complete the official Home Education Notification Form when registration opens on {registrationPhase.nextRegistrationDate && formatImportantDate(registrationPhase.nextRegistrationDate)}.
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