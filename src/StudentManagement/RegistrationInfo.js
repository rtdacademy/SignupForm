import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { getDatabase, ref, get, update } from 'firebase/database';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { 
  STATUS_OPTIONS, 
  ACTIVE_FUTURE_ARCHIVED_OPTIONS,
  STUDENT_TYPE_OPTIONS,
  getSchoolYearOptions,
  DIPLOMA_MONTH_OPTIONS,
  getDiplomaMonthColor 
} from '../config/DropdownOptions';
import { AlertCircle, Copy, ClipboardCheck, Edit } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { ScrollArea } from '../components/ui/scroll-area';
import SectionPicker from './SectionPicker';
import SchoolAddressPicker from '../components/SchoolAddressPicker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import GuardianManager from './GuardianManager';

const RegistrationInfo = ({ studentData, courseId, readOnly = false }) => {
  const [status, setStatus] = useState('');
  const [pasi, setPasi] = useState('');
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(courseId ? courseId.toString() : '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const [profileData, setProfileData] = useState({
    asn: '',
    firstName: '',
    lastName: '',
    age: '',
    studentPhone: '',
    parentGuardian: '',
    parentPhone: '',
    parentEmail: ''
  });

  const [courseData, setCourseData] = useState({
    activeFutureArchived: '',
    diplomaMonthChoices: '',
    over18: '',
    schoolYear: '',
    studentType: '',
    status: '',
    section: ''
  });

  const [showSchoolPicker, setShowSchoolPicker] = useState(false);
  const [schoolInfo, setSchoolInfo] = useState({
    name: '',
    placeId: '',
    address: null
  });

  // Add a new state for tracking diploma course status
  const [isDiplomaCourse, setIsDiplomaCourse] = useState(false);

  // Add this helper function inside the component
  const formatPhoneNumber = (phoneNumber, isInternational) => {
    if (!phoneNumber) return '';
    
    // Remove all non-digit characters
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    
    // If it's not an international student and the number doesn't start with 1,
    // add it (unless it's empty)
    if (!isInternational && digitsOnly.length > 0 && !digitsOnly.startsWith('1')) {
      return '1' + digitsOnly;
    }
    
    return digitsOnly;
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!studentData) return;

      const db = getDatabase();
      try {
        const coursesSnapshot = await get(ref(db, 'courses'));
        if (coursesSnapshot.exists()) {
          const coursesData = coursesSnapshot.val();
          const coursesList = Object.entries(coursesData)
            .map(([id, course]) => ({
              id: id.toString(),
              title: course.Title || 'Unknown Course'
            }))
            .sort((a, b) => a.title.localeCompare(b.title));
          
          setCourses(coursesList);
        }

        const isInternational = studentData.courses?.[courseId]?.StudentType?.Value === 'International Student';

        setProfileData({
          asn: studentData.profile?.asn || '',
          firstName: studentData.profile?.firstName || '',
          lastName: studentData.profile?.lastName || '',
          age: studentData.profile?.age || '',
          studentPhone: formatPhoneNumber(studentData.profile?.StudentPhone || '', isInternational),
          parentGuardian: studentData.profile?.Parent_x002f_Guardian || '',
          parentPhone: formatPhoneNumber(studentData.profile?.ParentPhone_x0023_ || '', isInternational),
          parentEmail: studentData.profile?.ParentEmail || ''
        });

        if (courseId && studentData.courses && studentData.courses[courseId]) {
          const course = studentData.courses[courseId];
          setStatus(course.Status?.Value || '');
          setPasi(course.PASI?.Value || '');
          setSelectedCourseId(courseId.toString());
          setCourseData({
            activeFutureArchived: course.ActiveFutureArchived?.Value || '',
            diplomaMonthChoices: course.DiplomaMonthChoices?.Value || '',
            over18: course.Over18_x003f_?.Value || '',
            schoolYear: course.School_x0020_Year?.Value || '',
            studentType: course.StudentType?.Value || '',
            status: course.Status?.Value || '',
            section: course.section || ''
          });

          setSchoolInfo({
            name: course.primarySchoolName || '',
            placeId: course.primarySchoolPlaceId || '',
            address: course.primarySchoolAddress || null
          });
        }

        // Add this new check for diploma course
        if (courseId) {
          const diplomaCourseSnapshot = await get(ref(db, `courses/${courseId}/DiplomaCourse`));
          setIsDiplomaCourse(diplomaCourseSnapshot.val() === 'Yes');
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [studentData, courseId]);

  // Modify the phone update handler
  const handlePhoneUpdate = async (field, value) => {
    if (readOnly) return;
    setError(null);

    const isInternational = courseData.studentType === 'International Student';
    const formattedValue = formatPhoneNumber(value, isInternational);

    const db = getDatabase();
    const studentKey = sanitizeEmail(studentData.profile.StudentEmail);
    
    try {
      await update(ref(db), {
        [`students/${studentKey}/profile/${field}`]: formattedValue
      });
      setProfileData(prev => ({ ...prev, [field]: formattedValue }));
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      setError(`Failed to update ${field}`);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (readOnly) return;
    setError(null);

    const db = getDatabase();
    const studentKey = sanitizeEmail(studentData.profile.StudentEmail);
    
    try {
      await update(ref(db), {
        [`students/${studentKey}/courses/${courseId}/Status/Value`]: newStatus,
        [`students/${studentKey}/courses/${courseId}/Status/Id`]: STATUS_OPTIONS.findIndex(opt => opt.value === newStatus) + 1
      });
      setStatus(newStatus);
      setCourseData(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status');
    }
  };

  const handlePasiChange = async (newPasi) => {
    if (readOnly) return;
    setError(null);

    const db = getDatabase();
    const studentKey = sanitizeEmail(studentData.profile.StudentEmail);
    
    try {
      await update(ref(db), {
        [`students/${studentKey}/courses/${courseId}/PASI/Value`]: newPasi,
        [`students/${studentKey}/courses/${courseId}/PASI/Id`]: newPasi === 'Yes' ? 1 : 2
      });
      setPasi(newPasi);
    } catch (error) {
      console.error('Error updating PASI:', error);
      setError('Failed to update PASI status');
    }
  };

  const handleProfileUpdate = async (field, value) => {
    if (readOnly) return;
    setError(null);

    const db = getDatabase();
    const studentKey = sanitizeEmail(studentData.profile.StudentEmail);
    
    try {
      await update(ref(db), {
        [`students/${studentKey}/profile/${field}`]: value
      });
      setProfileData(prev => ({ ...prev, [field]: value }));
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      setError(`Failed to update ${field}`);
    }
  };

  const handleCourseFieldUpdate = async (field, value, useIdValue = false) => {
    if (readOnly) return;
    setError(null);

    const db = getDatabase();
    const studentKey = sanitizeEmail(studentData.profile.StudentEmail);
    
    try {
      const updates = {};
      if (useIdValue) {
        const fieldName = field.replace('/Value', '');
        updates[`students/${studentKey}/courses/${courseId}/${field}`] = value;
        
        let id = 1;
        if (fieldName === 'StudentType') {
          id = STUDENT_TYPE_OPTIONS.findIndex(opt => opt.value === value) + 1;
        } else if (fieldName === 'ActiveFutureArchived') {
          id = ACTIVE_FUTURE_ARCHIVED_OPTIONS.findIndex(opt => opt.value === value) + 1;
        }
        
        updates[`students/${studentKey}/courses/${courseId}/${fieldName}/Id`] = id;
      } else {
        updates[`students/${studentKey}/courses/${courseId}/${field}`] = value;
      }
      
      await update(ref(db), updates);
      setCourseData(prev => ({ ...prev, [field.replace('/Value', '')]: value }));
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      setError(`Failed to update ${field}`);
    }
  };

  const handleSchoolUpdate = async (addressDetails) => {
    if (readOnly) return;
    setError(null);

    const db = getDatabase();
    const studentKey = sanitizeEmail(studentData.profile.StudentEmail);
    
    try {
      await update(ref(db), {
        [`students/${studentKey}/courses/${courseId}/primarySchoolName`]: addressDetails.name,
        [`students/${studentKey}/courses/${courseId}/primarySchoolPlaceId`]: addressDetails.placeId,
        [`students/${studentKey}/courses/${courseId}/primarySchoolAddress`]: {
          name: addressDetails.name,
          streetAddress: addressDetails.streetAddress,
          city: addressDetails.city,
          province: addressDetails.province,
          placeId: addressDetails.placeId,
          fullAddress: addressDetails.fullAddress,
          location: addressDetails.location
        }
      });

      setSchoolInfo({
        name: addressDetails.name,
        placeId: addressDetails.placeId,
        address: {
          name: addressDetails.name,
          streetAddress: addressDetails.streetAddress,
          city: addressDetails.city,
          province: addressDetails.province,
          placeId: addressDetails.placeId,
          fullAddress: addressDetails.fullAddress,
          location: addressDetails.location
        }
      });

      setShowSchoolPicker(false);
    } catch (error) {
      console.error('Error updating school:', error);
      setError('Failed to update school information');
    }
  };

  const copyASN = async () => {
    try {
      await navigator.clipboard.writeText(profileData.asn);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy ASN');
    }
  };

  // Helper function to render PhoneInput
  const renderPhoneInput = (value, onChange, field) => {
    const isInternational = courseData.studentType === 'International Student';
    
    return (
      <PhoneInput
        country={'ca'}
        value={value}
        onChange={(value) => onChange(field, value)}
        disabled={readOnly}
        priority={{ ca: 0, us: 1 }}
        inputStyle={{
          width: '100%',
          height: '36px'
        }}
        // Hide country select unless international
        countryCodeEditable={isInternational}
        // Hide flag unless international
        enableAreaCodes={isInternational}
        // If not international, force CA
        onlyCountries={isInternational ? undefined : ['ca']}
      />
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    
      <Dialog open={showSchoolPicker} onOpenChange={setShowSchoolPicker}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Select School</DialogTitle>
            <DialogDescription>
              Search and select the primary school from the list
            </DialogDescription>
          </DialogHeader>
          <SchoolAddressPicker
            onAddressSelect={handleSchoolUpdate}
            initialValue={schoolInfo.address}
          />
        </DialogContent>
      </Dialog>

      <ScrollArea className="flex-1 min-h-0">
        <div className="grid gap-4 pr-4" style={{ 
         gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 600px), 1fr))',
          alignItems: 'start'
        }}>
          {/* Course Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={courseData.activeFutureArchived}
                onValueChange={(value) => handleCourseFieldUpdate('ActiveFutureArchived/Value', value, true)}
                disabled={readOnly}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Active/Future/Archived" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVE_FUTURE_ARCHIVED_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span style={{ color: option.color }}>{option.value}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={courseData.studentType}
                onValueChange={(value) => handleCourseFieldUpdate('StudentType/Value', value, true)}
                disabled={readOnly}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Student Type" />
                </SelectTrigger>
                <SelectContent>
                  {STUDENT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span style={{ color: option.color }}>{option.value}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={courseData.schoolYear}
                onValueChange={(value) => handleCourseFieldUpdate('School_x0020_Year/Value', value, true)}
                disabled={readOnly}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="School Year" />
                </SelectTrigger>
                <SelectContent>
                  {getSchoolYearOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span style={{ color: option.color }}>{option.value}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={courseData.status}
                onValueChange={handleStatusChange}
                disabled={readOnly}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span style={{ color: option.color }}>{option.value}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="space-y-1.5">
                <Label className="text-xs">PASI Status</Label>
                <Select
                  value={pasi}
                  onValueChange={handlePasiChange}
                  disabled={readOnly}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="PASI Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Yes', 'No', 'Pending'].map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Modify the diploma month choices render condition to use isDiplomaCourse */}
              {isDiplomaCourse && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Diploma Month</Label>
                  <Select
                    value={courseData.diplomaMonthChoices}
                    onValueChange={(value) => handleCourseFieldUpdate('DiplomaMonthChoices/Value', value, true)}
                    disabled={readOnly}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Diploma Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIPLOMA_MONTH_OPTIONS.map((option) => (
                        <SelectItem 
                          key={option.value} 
                          value={option.value}
                        >
                          <span style={{ color: option.color }}>
                            {option.value}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs">Over 18</Label>
                <Input
                  value={courseData.over18}
                  placeholder="Over 18"
                  disabled={true}
                />
              </div>

              {/* Section Input */}
              <div className="space-y-1.5">
                <Label className="text-xs">Section</Label>
                <SectionPicker
                  value={courseData.section}
                  onChange={(value) => handleCourseFieldUpdate('section', value)}
                  disabled={readOnly}
                />
              </div>
            </CardContent>
          </Card>

          {/* Student Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Student Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Input
                  className="flex-1"
                  value={profileData.asn}
                  onChange={(e) => handleProfileUpdate('asn', e.target.value)}
                  placeholder="ASN"
                  disabled={readOnly}
                />
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={copyASN}
                >
                  {copied ? <ClipboardCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <Input
                value={profileData.firstName}
                onChange={(e) => handleProfileUpdate('firstName', e.target.value)}
                placeholder="First Name"
                disabled={readOnly}
              />
              <Input
                value={profileData.lastName}
                onChange={(e) => handleProfileUpdate('lastName', e.target.value)}
                placeholder="Last Name"
                disabled={readOnly}
              />
              <div className="space-y-1.5">
                <Label className="text-xs">Age</Label>
                <Input
                  value={profileData.age}
                  placeholder="Age"
                  disabled={true}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Student Phone</Label>
                {renderPhoneInput(
                  profileData.studentPhone,
                  handlePhoneUpdate,
                  'StudentPhone'
                )}
              </div>
            </CardContent>
          </Card>

          {/* Primary School Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Primary School Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Primary School</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={schoolInfo.name}
                    placeholder="Primary School Name"
                    disabled={true}
                    className="flex-1"
                  />
                  {!readOnly && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSchoolPicker(true)}
                      className="shrink-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {schoolInfo.address && (
                  <p className="text-xs text-gray-500 mt-1">
                    {schoolInfo.address.fullAddress}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Parent/Guardian Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Parent/Guardian Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                value={profileData.parentGuardian}
                onChange={(e) => handleProfileUpdate('Parent_x002f_Guardian', e.target.value)}
                placeholder="Parent/Guardian Name"
                disabled={readOnly}
              />
              <div className="space-y-1.5">
                <Label className="text-xs">Parent Phone</Label>
                {renderPhoneInput(
                  profileData.parentPhone,
                  handlePhoneUpdate,
                  'ParentPhone_x0023_'
                )}
              </div>
              <Input
                value={profileData.parentEmail}
                onChange={(e) => handleProfileUpdate('ParentEmail', e.target.value)}
                placeholder="Parent Email"
                disabled={readOnly}
              />
            </CardContent>
          </Card>

          <Card>
  <CardHeader>
    <CardTitle className="text-sm">Additional Guardians</CardTitle>
  </CardHeader>
  <CardContent>
    <GuardianManager 
      studentKey={sanitizeEmail(studentData.profile.StudentEmail)}
      readOnly={readOnly}
    />
  </CardContent>
</Card>

        </div>
      </ScrollArea>
    </div>
  );
};

export default RegistrationInfo;
