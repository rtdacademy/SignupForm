import React, { useState, useEffect, useMemo } from 'react';
import { getDatabase, ref, onValue, off, query, orderByChild, equalTo, get } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { useStaffClaims } from '../customClaims/useStaffClaims';
import {
  Search,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  GraduationCap,
  ClipboardCheck,
  AlertTriangle,
  Edit3,
  Filter,
  XCircle,
  Copy,
  Check
} from 'lucide-react';
import { getCurrentSchoolYear } from '../config/calendarConfig';
import { getSchoolYearOptions } from '../config/DropdownOptions';
import CourseActionSheet from './components/CourseActionSheet';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import { toast } from 'sonner';

/**
 * Helper function to convert school year format
 * @param {string} dbFormat - Format like "25_26"
 * @returns {string} - Format like "25/26"
 */
const convertSchoolYear = (dbFormat) => dbFormat?.replace('_', '/') || '';

/**
 * Helper function to convert to database format
 * @param {string} displayFormat - Format like "25/26"
 * @returns {string} - Format like "25_26"
 */
const convertToDbFormat = (displayFormat) => displayFormat?.replace('/', '_') || '';

/**
 * Get status badge configuration based on course status
 */
const getStatusBadge = (courseStatus) => {
  if (courseStatus.registrarConfirmedMark) {
    return { color: 'bg-green-100 text-green-800 border-green-300', text: 'Complete', icon: CheckCircle2 };
  }
  if (courseStatus.finalMark !== null && courseStatus.finalMark !== undefined && !courseStatus.registrarConfirmedMark) {
    return { color: 'bg-blue-100 text-blue-800 border-blue-300', text: 'Mark Pending', icon: Clock };
  }
  if (courseStatus.registrarConfirmedRegistration) {
    return { color: 'bg-blue-100 text-blue-800 border-blue-300', text: 'Registered', icon: ClipboardCheck };
  }
  if (courseStatus.needsPasiRegistration && !courseStatus.registrarConfirmedRegistration) {
    return { color: 'bg-orange-100 text-orange-800 border-orange-300', text: 'Registration Pending', icon: AlertCircle };
  }
  if (courseStatus.committed) {
    return { color: 'bg-gray-100 text-gray-800 border-gray-300', text: 'Committed', icon: FileText };
  }
  return { color: 'bg-gray-100 text-gray-600 border-gray-200', text: 'Not Committed', icon: XCircle };
};

const CourseStatusDashboard = () => {
  const { user } = useAuth();
  const { hasPermission, isStaff, isAdmin, loading: claimsLoading } = useStaffClaims();

  // Debug claims loading
  useEffect(() => {
    console.log('Staff claims loading state:', claimsLoading);
    console.log('User:', user?.email);
    console.log('Is staff:', isStaff);
  }, [claimsLoading, user, isStaff]);

  const [courseStatuses, setCourseStatuses] = useState({});
  const [studentCache, setStudentCache] = useState({}); // Cache for student names
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('add-to-pasi');
  const [activeSchoolYear, setActiveSchoolYear] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedFamilyData, setSelectedFamilyData] = useState(null);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);

  // Get school year options
  const schoolYearOptions = useMemo(() => getSchoolYearOptions(), []);

  // Initialize active school year
  useEffect(() => {
    const currentYear = getCurrentSchoolYear();
    console.log('Initializing school year:', currentYear);
    setActiveSchoolYear(currentYear);

    // Safety timeout - if loading state doesn't change in 10 seconds, force it to false
    const timeoutId = setTimeout(() => {
      console.warn('Loading timeout reached - forcing loading to false');
      setLoading(false);
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, []);

  // Fetch course statuses from courseStatusSummary
  useEffect(() => {
    if (!activeSchoolYear) {
      console.log('No active school year set yet');
      return;
    }

    console.log('Fetching course statuses for school year:', activeSchoolYear);
    const db = getDatabase();
    const dbSchoolYear = convertToDbFormat(activeSchoolYear);
    console.log('Database school year format:', dbSchoolYear);

    const courseStatusQuery = query(
      ref(db, 'homeEducationFamilies/courseStatusSummary'),
      orderByChild('schoolYear'),
      equalTo(dbSchoolYear)
    );

    const unsubscribe = onValue(
      courseStatusQuery,
      (snapshot) => {
        console.log('Firebase query snapshot received:', snapshot.exists());
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log('Course statuses found:', Object.keys(data).length);
          setCourseStatuses(data);
        } else {
          console.log('No course statuses found for this school year');
          setCourseStatuses({});
        }
        setLoading(false);
      },
      (error) => {
        console.error('Firebase query error:', error);
        //toast.error(`Failed to load course statuses: ${error.message}`);
        setCourseStatuses({});
        setLoading(false);
      }
    );

    return () => off(courseStatusQuery, 'value', unsubscribe);
  }, [activeSchoolYear]);

  // Fetch student name from cache or database
  const fetchStudentName = async (familyId, studentId) => {
    const cacheKey = `${familyId}_${studentId}`;

    // Return from cache if available
    if (studentCache[cacheKey]) {
      return studentCache[cacheKey];
    }

    try {
      const db = getDatabase();
      const studentRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/students/${studentId}`);
      const snapshot = await get(studentRef);

      if (snapshot.exists()) {
        const student = snapshot.val();
        const name = `${student.firstName || ''} ${student.lastName || ''}`.trim();

        // Cache the name
        setStudentCache(prev => ({ ...prev, [cacheKey]: name }));
        return name;
      }
    } catch (error) {
      console.error('Error fetching student name:', error);
    }

    return 'Unknown Student';
  };

  // Process course statuses for display
  const processedCourses = useMemo(() => {
    const coursesList = Object.entries(courseStatuses).map(([key, course]) => {
      const statusBadge = getStatusBadge(course);

      return {
        ...course,
        summaryKey: key,
        statusBadge,
        searchableText: [
          course.courseName,
          course.courseCode,
          course.description,
          course.registrarComment
        ].filter(Boolean).join(' ').toLowerCase()
      };
    });

    // Sort by lastUpdated (most recent first)
    return coursesList.sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
  }, [courseStatuses]);

  // Filter courses based on tab and search
  const filteredCourses = useMemo(() => {
    let filtered = processedCourses;

    // Tab filtering
    switch (selectedTab) {
      case 'add-to-pasi':
        // Show courses that need PASI registration but don't have a final mark yet
        // Once registrar confirms registration, they disappear from this list
        filtered = filtered.filter(c =>
          c.needsPasiRegistration === true &&
          (c.finalMark === null || c.finalMark === undefined) &&
          !c.registrarConfirmedRegistration
        );
        break;
    }

    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(c => {
        // Check searchable text
        if (c.searchableText.includes(searchLower)) return true;

        // Check student name if cached
        const cacheKey = `${c.familyId}_${c.studentId}`;
        if (studentCache[cacheKey] && studentCache[cacheKey].toLowerCase().includes(searchLower)) {
          return true;
        }

        return false;
      });
    }

    return filtered;
  }, [processedCourses, selectedTab, searchTerm, studentCache]);

  // Filter completed registrations (registrarConfirmedRegistration === true)
  const completedRegistrations = useMemo(() => {
    let completed = processedCourses.filter(c =>
      c.needsPasiRegistration === true &&
      c.registrarConfirmedRegistration === true
    );

    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      completed = completed.filter(c => {
        // Check searchable text
        if (c.searchableText.includes(searchLower)) return true;

        // Check student name if cached
        const cacheKey = `${c.familyId}_${c.studentId}`;
        if (studentCache[cacheKey] && studentCache[cacheKey].toLowerCase().includes(searchLower)) {
          return true;
        }

        return false;
      });
    }

    return completed;
  }, [processedCourses, searchTerm, studentCache]);

  // Handle opening course action sheet
  const handleOpenCourseAction = async (courseSummary) => {
    console.log('=== ACTION BUTTON CLICKED ===');
    console.log('Course Summary:', courseSummary);
    setLoadingAction(courseSummary.summaryKey);

    try {
      // Fetch family data
      const db = getDatabase();
      const familyRef = ref(db, `homeEducationFamilies/familyInformation/${courseSummary.familyId}`);
      const familySnapshot = await get(familyRef);

      if (!familySnapshot.exists()) {
        toast.error('Family data not found');
        return;
      }

      const familyData = familySnapshot.val();
      const student = familyData.students?.[courseSummary.studentId];

      if (!student) {
        toast.error('Student not found');
        return;
      }

      const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim();

      // Construct course object from summary data
      const course = {
        id: courseSummary.courseId,
        name: courseSummary.courseName,
        code: courseSummary.courseCode,
        description: courseSummary.description,
        credits: courseSummary.credits,
        isAlbertaCourse: courseSummary.courseSource === 'albertaCourse'
      };

      // For other courses, include additional fields
      if (courseSummary.courseSource === 'otherCourse') {
        course.courseCode = courseSummary.courseCode;
        course.courseName = courseSummary.courseName;
      }

      console.log('Constructed course object:', course);
      console.log('Student name:', studentName);
      console.log('Family ID:', courseSummary.familyId);
      console.log('School year:', courseSummary.schoolYear);
      console.log('Student ID:', parseInt(courseSummary.studentId));

      // Use the course summary data we already have (it's already in sync)
      const initialStatus = {
        committed: courseSummary.committed || false,
        needsPasiRegistration: courseSummary.needsPasiRegistration || false,
        pasiRegistrationComment: courseSummary.pasiRegistrationComment || '',
        registrarConfirmedRegistration: courseSummary.registrarConfirmedRegistration || false,
        finalMark: courseSummary.finalMark,
        registrarComment: courseSummary.registrarComment || '',
        registrarConfirmedMark: courseSummary.registrarConfirmedMark || false,
        courseCodeVerified: courseSummary.courseCodeVerified || false,
      };

      const selectedCourseData = {
        course,
        studentName,
        familyId: courseSummary.familyId,
        schoolYear: courseSummary.schoolYear, // Keep in database format (25_26) for getCourseStatus
        studentId: parseInt(courseSummary.studentId),
        asn: student.asn, // Add ASN for PASI action buttons
        familyData,
        initialStatus
      };

      console.log('Setting selectedCourse with:', selectedCourseData);
      console.log('Initial status from summary:', initialStatus);
      setSelectedCourse(selectedCourseData);
      setSelectedFamilyData(familyData);
      console.log('Opening action sheet...');
      setActionSheetOpen(true);

    } catch (error) {
      console.error('Error fetching family data:', error);
      //toast.error('Failed to load course details');
    } finally {
      setLoadingAction(null);
    }
  };

  // Handle remove course
  const handleRemoveCourse = (course) => {
    // This will be handled by the CourseActionSheet component
    // which will call the removeCourse utility function
    toast.success('Course removed successfully');
    setActionSheetOpen(false);
  };

  // Handle status update
  const handleStatusUpdate = () => {
    // Data will automatically update via Firebase listener
    toast.success('Status updated successfully');
  };

  // Get tab counts
  const tabCounts = useMemo(() => {
    return {
      addToPasi: processedCourses.filter(c =>
        c.needsPasiRegistration === true &&
        (c.finalMark === null || c.finalMark === undefined) &&
        !c.registrarConfirmedRegistration
      ).length
    };
  }, [processedCourses]);

  if (loading || claimsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <div className="text-gray-600 text-center">
          {claimsLoading && <p>Loading staff permissions...</p>}
          {loading && !claimsLoading && <p>Loading course statuses...</p>}
          {!activeSchoolYear && <p className="text-sm text-gray-400">Initializing school year...</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">PASI Registration Management</h1>
              <p className="text-gray-600 mt-1">Manage PASI registrations and mark submissions for home education students</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={activeSchoolYear} onValueChange={setActiveSchoolYear}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="School Year" />
                </SelectTrigger>
                <SelectContent>
                  {schoolYearOptions.map(option => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                    >
                      {option.value}
                      {option.isDefault && ' (Current)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by student name, course name, course code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Card>
          <CardContent className="p-0">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="w-full justify-start rounded-none border-b">
                <TabsTrigger value="add-to-pasi" className="flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4" />
                  Add to PASI
                  <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-800">
                    {tabCounts.addToPasi}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              {/* Table Content */}
              <TabsContent value={selectedTab} className="m-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Student Name</TableHead>
                        <TableHead className="w-[140px]">ASN</TableHead>
                        <TableHead className="w-[100px]">Course Code</TableHead>
                        <TableHead className="w-[150px]">Last Updated</TableHead>
                        <TableHead className="min-w-[300px]">PASI Comment</TableHead>
                        <TableHead className="text-right w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCourses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                            <ClipboardCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="font-medium">No courses need PASI registration</p>
                            <p className="text-sm mt-2 text-gray-400">
                              Courses will appear here when students request PASI registration
                            </p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCourses.map((course) => (
                          <CourseStatusRow
                            key={course.summaryKey}
                            course={course}
                            studentCache={studentCache}
                            fetchStudentName={fetchStudentName}
                            onOpenAction={handleOpenCourseAction}
                            isLoading={loadingAction === course.summaryKey}
                          />
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Completed Registrations Accordion */}
        {selectedTab === 'add-to-pasi' && completedRegistrations.length > 0 && (
          <Card className="mt-4 bg-gray-50/50 border-gray-200">
            <CardContent className="p-4">
              <Accordion type="single" collapsible>
                <AccordionItem value="completed" className="border-none">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-gray-700">
                        Completed PASI Registrations
                      </span>
                      <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                        {completedRegistrations.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="mt-2 rounded-lg border border-gray-200 bg-white">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50/50">
                            <TableHead className="w-[180px]">Student Name</TableHead>
                            <TableHead className="w-[140px]">ASN</TableHead>
                            <TableHead className="w-[100px]">Course Code</TableHead>
                            <TableHead className="w-[150px]">Last Updated</TableHead>
                            <TableHead className="min-w-[300px]">PASI Comment</TableHead>
                            <TableHead className="text-right w-[80px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {completedRegistrations.map((course) => (
                            <CourseStatusRow
                              key={course.summaryKey}
                              course={course}
                              studentCache={studentCache}
                              fetchStudentName={fetchStudentName}
                              onOpenAction={handleOpenCourseAction}
                              isLoading={loadingAction === course.summaryKey}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Course Action Sheet */}
      <CourseActionSheet
        open={actionSheetOpen && selectedCourse !== null}
        onOpenChange={setActionSheetOpen}
        course={selectedCourse?.course}
        studentName={selectedCourse?.studentName}
        familyId={selectedCourse?.familyId}
        schoolYear={selectedCourse?.schoolYear}
        studentId={selectedCourse?.studentId}
        asn={selectedCourse?.asn}
        initialStatus={selectedCourse?.initialStatus}
        isRegistrarMode={true}
        highlightAccordion={selectedTab === 'add-to-pasi' ? 'step2' : null}
        onRemoveCourse={handleRemoveCourse}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

/**
 * Copyable Cell Component - Click to copy content
 */
const CopyableCell = ({ value, className = "" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy');
    }
  };

  if (!value) {
    return <TableCell className={className}><span className="text-gray-400">—</span></TableCell>;
  }

  return (
    <TableCell
      className={`cursor-pointer hover:bg-blue-50 transition-colors group ${className}`}
      onClick={handleCopy}
      title="Click to copy"
    >
      <div className="flex items-center gap-2">
        <span>{value}</span>
        {copied ? (
          <Check className="w-3 h-3 text-green-600" />
        ) : (
          <Copy className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    </TableCell>
  );
};

/**
 * Comment Dialog Component - Click to view full comment
 */
const CommentDialog = ({ comment }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!comment) return;

    try {
      await navigator.clipboard.writeText(comment);
      setCopied(true);
      toast.success('Comment copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy');
    }
  };

  if (!comment) {
    return <span className="text-gray-400">—</span>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer hover:bg-blue-50 transition-colors px-2 py-1 rounded">
          <span className="line-clamp-2">{comment}</span>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>PASI Registration Comment</DialogTitle>
          <DialogDescription>
            Full comment details
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-900 whitespace-pre-wrap">{comment}</p>
          </div>
          <Button
            variant="outline"
            onClick={handleCopy}
            className="w-full"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Comment
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Copyable Cell with Tooltip - Click to copy, hover for details
 */
const CopyableCellWithTooltip = ({ value, tooltipContent, className = "", codeBlock = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation(); // Prevent tooltip from closing
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy');
    }
  };

  if (!value) {
    return <TableCell className={className}><span className="text-gray-400">—</span></TableCell>;
  }

  return (
    <TableCell className={className}>
      <TooltipProvider>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <div
              className="cursor-pointer hover:bg-blue-50 transition-colors group inline-flex items-center gap-2 px-2 py-1 rounded"
              onClick={handleCopy}
            >
              <span className={codeBlock ? "font-mono text-sm bg-gray-100 px-2 py-0.5 rounded" : ""}>
                {value}
              </span>
              {copied ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </TableCell>
  );
};

/**
 * Course Status Row Component
 */
const CourseStatusRow = ({ course, studentCache, fetchStudentName, onOpenAction, isLoading }) => {
  const [studentName, setStudentName] = useState(null);
  const [loadingName, setLoadingName] = useState(false);

  const cacheKey = `${course.familyId}_${course.studentId}`;

  // Load student name on mount
  useEffect(() => {
    const loadName = async () => {
      if (studentCache[cacheKey]) {
        setStudentName(studentCache[cacheKey]);
      } else {
        setLoadingName(true);
        const name = await fetchStudentName(course.familyId, course.studentId);
        setStudentName(name);
        setLoadingName(false);
      }
    };
    loadName();
  }, [course.familyId, course.studentId, studentCache, cacheKey, fetchStudentName]);

  // Format ASN with dashes (1234-5678-9)
  const formatASN = (asn) => {
    if (!asn) return '—';
    const asnStr = asn.toString().replace(/\D/g, ''); // Remove non-digits
    if (asnStr.length === 9) {
      return `${asnStr.slice(0, 4)}-${asnStr.slice(4, 8)}-${asnStr.slice(8)}`;
    }
    return asn; // Return as-is if not 9 digits
  };

  // Format last updated date
  const formatDate = (timestamp) => {
    if (!timestamp) return '—';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <TableRow className="hover:bg-gray-50">
      {/* Student Name */}
      <CopyableCell value={studentName} className="font-medium w-[180px]" />

      {/* ASN */}
      <CopyableCell value={formatASN(course.asn)} className="w-[140px] text-sm" />

      {/* Course Code with Tooltip */}
      <CopyableCellWithTooltip
        value={course.courseCode}
        className="w-[100px]"
        codeBlock={true}
        tooltipContent={
          <div className="space-y-1">
            <p className="font-semibold">{course.courseName}</p>
            {course.description && (
              <p className="text-sm text-gray-600">{course.description}</p>
            )}
            {course.credits && (
              <p className="text-sm">
                <span className="font-medium">Credits:</span> {course.credits}
              </p>
            )}
          </div>
        }
      />

      {/* Last Updated */}
      <CopyableCell value={formatDate(course.lastUpdated)} className="w-[150px] text-sm" />

      {/* PASI Registration Comment */}
      <TableCell className="min-w-[300px]">
        <CommentDialog comment={course.pasiRegistrationComment} />
      </TableCell>

      {/* Action Button */}
      <TableCell className="text-right w-[80px]">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onOpenAction(course)}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Edit3 className="w-4 h-4" />
          )}
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default CourseStatusDashboard;
