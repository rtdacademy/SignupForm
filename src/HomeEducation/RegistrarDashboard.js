import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getDatabase, ref, onValue, off, update, get, query, orderByChild, equalTo } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { useStaffClaims } from '../customClaims/useStaffClaims';
import { 
  Users, 
  Search, 
  Eye, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Hash,
  FileText,
  AlertTriangle,
  Loader2,
  ClipboardList,
  CheckSquare,
  XCircle
} from 'lucide-react';
import { 
  getCurrentSchoolYear, 
  getOpenRegistrationSchoolYear,
} from '../config/importantDates';
import { formatDateForDisplay } from '../utils/timeZoneUtils';
import StudentRegistrationCard from './RegistrarComponents/StudentRegistrationCard';
import RegistrationDetailSheet from './RegistrarComponents/RegistrationDetailSheet';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../components/ui/dropdown-menu';
import { toast } from 'sonner';

// Helper function to determine student registration status
const determineStudentStatus = (student, familyData, schoolYear) => {
  const dbSchoolYear = schoolYear.replace('/', '_');
  
  // Check if student has ASN or is marked as ready for PASI (ASN to be created)
  const hasASN = !!student.asn;
  const isReadyForPASI = student.readyForPASI === true;
  const hasIdentification = hasASN || isReadyForPASI;
  
  // Check notification form status
  const notificationForm = familyData?.NOTIFICATION_FORMS?.[dbSchoolYear]?.[student.id];
  const hasNotificationForm = !!notificationForm;
  const notificationFormSubmitted = notificationForm?.submissionStatus === 'submitted';
  
  // Check citizenship docs
  const citizenshipDocs = familyData?.STUDENT_CITIZENSHIP_DOCS?.[student.id];
  const hasApprovedDocs = citizenshipDocs?.staffApproval?.isApproved === true || 
                          citizenshipDocs?.completionStatus === 'completed';
  const docsNeedReview = citizenshipDocs?.requiresStaffReview === true;
  
  // Check SOLO plan
  const soloPlan = familyData?.SOLO_EDUCATION_PLANS?.[dbSchoolYear]?.[student.id];
  const hasSoloPlan = !!soloPlan;
  const soloPlanSubmitted = soloPlan?.submissionStatus === 'submitted';
  
  // Check if marked as registered in PASI
  const pasiRegistration = familyData?.PASI_REGISTRATIONS?.[dbSchoolYear]?.[student.id];
  const registeredInPasi = pasiRegistration?.status === 'completed';
  
  // Determine overall status
  if (registeredInPasi) {
    // Check if registration is complete or incomplete
    const missingItems = [];
    if (!hasASN && !isReadyForPASI) missingItems.push('ASN');
    if (!hasApprovedDocs) missingItems.push('Citizenship Docs');
    if (!hasSoloPlan || !soloPlanSubmitted) missingItems.push('Education Plan');
    
    if (missingItems.length > 0) {
      return {
        status: 'incomplete',
        label: `Incomplete - Missing: ${missingItems.join(', ')}`,
        color: 'yellow',
        priority: 1,
        missingItems,
        needsASNCreation: isReadyForPASI && !hasASN
      };
    }
    
    return {
      status: 'completed',
      label: 'Registered in PASI - Complete',
      color: 'green',
      priority: 0
    };
  }
  
  // Not registered in PASI yet - check requirements
  if (!hasNotificationForm || !notificationFormSubmitted) {
    return {
      status: 'missing-notification',
      label: 'Missing Notification Form',
      color: 'orange',
      priority: 3
    };
  }
  
  // Has notification form but missing identification (ASN or readyForPASI flag)
  if (!hasIdentification) {
    const missingItems = ['ASN'];
    if (!hasApprovedDocs) missingItems.push('Citizenship Docs');
    if (!hasSoloPlan || !soloPlanSubmitted) missingItems.push('Education Plan');
    
    return {
      status: 'missing-asn',
      label: `Missing ASN Required for PASI (Also missing: ${missingItems.slice(1).join(', ') || 'None'})`,
      color: 'red',
      priority: 2.5,
      missingItems
    };
  }
  
  // Has notification form AND (ASN or readyForPASI) - ready for PASI
  const missingItems = [];
  if (!hasApprovedDocs) missingItems.push('Citizenship Docs');
  if (!hasSoloPlan || !soloPlanSubmitted) missingItems.push('Education Plan');
  
  // Add special indicator if ASN needs to be created
  const needsASNCreation = isReadyForPASI && !hasASN;
  
  return {
    status: 'ready',
    label: needsASNCreation 
      ? (missingItems.length > 0 
          ? `Ready for PASI - ASN pending (Missing: ${missingItems.join(', ')})` 
          : 'Ready for PASI - ASN pending')
      : (missingItems.length > 0 
          ? `Ready for PASI (Missing: ${missingItems.join(', ')})` 
          : 'Ready for PASI'),
    color: 'blue',
    priority: 2,
    missingItems,
    needsASNCreation
  };
};

const RegistrarDashboard = (props) => {
  const { user } = useAuth();
  const { hasPermission, isStaff, isAdmin, loading: claimsLoading } = useStaffClaims();
  
  // Props from Layout for Home Education Header functionality
  const {
    showMyFamiliesOnly = false,
    setShowMyFamiliesOnly = () => {},
    impersonatingFacilitator = null,
    setImpersonatingFacilitator = () => {},
    statusFilter = 'active',
    setStatusFilter = () => {},
    homeEducationStats,
    setHomeEducationStats
  } = props;
  const [families, setFamilies] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('queue');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [activeSchoolYear, setActiveSchoolYear] = useState('');
  const [filters, setFilters] = useState({
    facilitator: 'all',
    grade: 'all',
    status: 'all',
    missingData: 'all'
  });
  
  // Initialize active school year
  useEffect(() => {
    const currentYear = getCurrentSchoolYear();
    const openRegistrationYear = getOpenRegistrationSchoolYear();
    const targetSchoolYear = openRegistrationYear || currentYear;
    setActiveSchoolYear(targetSchoolYear);
  }, []);
  
  // Fetch families data - Use efficient database query based on status filter
  useEffect(() => {
    if (!activeSchoolYear) return;
    
    const db = getDatabase();
    
    // Always filter by status for performance - default is 'active'
    // This prevents loading all families which could be a large dataset
    const familiesRef = query(
      ref(db, 'homeEducationFamilies/familyInformation'),
      orderByChild('status'),
      equalTo(statusFilter) // statusFilter defaults to 'active'
    );
    
    const unsubscribe = onValue(familiesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setFamilies(data);
      } else {
        // No families found for this status
        setFamilies({});
      }
      setLoading(false);
    });
    
    return () => off(familiesRef, 'value', unsubscribe);
  }, [activeSchoolYear, statusFilter]);
  // Process students for display
  const processedStudents = useMemo(() => {
    const studentsList = [];
    
    Object.entries(families).forEach(([familyId, family]) => {
      if (family.students) {
        Object.values(family.students).forEach(student => {
          const status = determineStudentStatus(student, family, activeSchoolYear);
          const primaryGuardian = family.guardians ? 
            Object.values(family.guardians).find(g => g.guardianType === 'primary_guardian') || 
            Object.values(family.guardians)[0] : null;
          
          // Collect all guardian emails and names
          const guardianEmails = [];
          const guardianNames = [];
          if (family.guardians) {
            Object.values(family.guardians).forEach(guardian => {
              if (guardian.email) guardianEmails.push(guardian.email.toLowerCase());
              if (guardian.firstName) guardianNames.push(guardian.firstName.toLowerCase());
              if (guardian.lastName) guardianNames.push(guardian.lastName.toLowerCase());
            });
          }
          
          // Normalize ASN for searching (remove hyphens)
          const normalizedAsn = student.asn ? student.asn.replace(/-/g, '') : '';
          
          // Build comprehensive searchable text
          const searchableText = [
            student.firstName,
            student.lastName,
            student.email,
            student.asn,
            normalizedAsn,
            family.familyName,
            ...guardianEmails,
            ...guardianNames
          ].filter(Boolean).join(' ').toLowerCase();
          
          studentsList.push({
            ...student,
            familyId,
            familyName: family.familyName,
            familyData: family,
            facilitatorEmail: family.facilitatorEmail,
            primaryGuardian,
            registrationStatus: status,
            searchableText,
            guardianEmails,
            guardianNames
          });
        });
      }
    });
    
    // Sort by priority
    return studentsList.sort((a, b) => {
      return b.registrationStatus.priority - a.registrationStatus.priority;
    });
  }, [families, activeSchoolYear]);
  
  // Filter students based on tab and filters
  const filteredStudents = useMemo(() => {
    let filtered = processedStudents;
    
    // Note: Active/inactive filtering is now done at the database query level
    // So we don't need to filter by status here anymore
    
    // Filter by tab
    switch (selectedTab) {
      case 'queue':
        filtered = filtered.filter(s => 
          s.registrationStatus.status === 'missing-notification' ||
          s.registrationStatus.status === 'missing-asn'
        );
        break;
      case 'ready':
        filtered = filtered.filter(s => s.registrationStatus.status === 'ready');
        break;
      case 'incomplete':
        filtered = filtered.filter(s => s.registrationStatus.status === 'incomplete');
        break;
      case 'completed':
        filtered = filtered.filter(s => s.registrationStatus.status === 'completed');
        break;
    }
    
    // Apply search with support for multiple formats
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      // Normalize search term for ASN (remove hyphens and spaces)
      const normalizedSearch = searchLower.replace(/[-\s]/g, '');
      
      filtered = filtered.filter(s => {
        // Check regular searchable text
        if (s.searchableText.includes(searchLower)) return true;
        
        // Check normalized ASN search
        if (s.asn) {
          const studentAsnNormalized = s.asn.replace(/[-\s]/g, '').toLowerCase();
          if (studentAsnNormalized.includes(normalizedSearch)) return true;
        }
        
        return false;
      });
    }
    
    // Apply filters
    if (filters.facilitator !== 'all') {
      filtered = filtered.filter(s => s.facilitatorEmail === filters.facilitator);
    }
    
    if (filters.grade !== 'all') {
      filtered = filtered.filter(s => s.grade === filters.grade);
    }
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(s => s.registrationStatus.status === filters.status);
    }
    
    if (filters.missingData !== 'all') {
      switch (filters.missingData) {
        case 'asn':
          filtered = filtered.filter(s => !s.asn);
          break;
        case 'docs':
          filtered = filtered.filter(s => {
            const citizenshipDocs = s.familyData?.STUDENT_CITIZENSHIP_DOCS?.[s.id];
            const hasApprovedDocs = citizenshipDocs?.staffApproval?.isApproved === true || 
                                    citizenshipDocs?.completionStatus === 'completed';
            return !hasApprovedDocs;
          });
          break;
        case 'address':
          filtered = filtered.filter(s => !s.primaryGuardian?.address);
          break;
      }
    }
    
    return filtered;
  }, [processedStudents, selectedTab, searchTerm, filters]);
  
  // Handle student selection
  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setSelectedFamily(student.familyData);
    setDetailSheetOpen(true);
  };
  
  
  // Handle marking as registered in PASI
  const handleMarkAsRegistered = async (studentId, familyId) => {
    try {
      const db = getDatabase();
      const dbSchoolYear = activeSchoolYear.replace('/', '_');
      const pasiRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/PASI_REGISTRATIONS/${dbSchoolYear}/${studentId}`);
      
      await update(pasiRef, {
        status: 'completed',
        registeredAt: Date.now(),
        registeredBy: user.email,
        registeredByUid: user.uid
      });
      
      toast.success('Student marked as registered in PASI');
    } catch (error) {
      console.error('Error marking as registered:', error);
      toast.error('Failed to update registration status');
    }
  };
  
  // Get unique facilitators for filter
  const uniqueFacilitators = useMemo(() => {
    const facilitators = new Set();
    Object.values(families).forEach(family => {
      if (family.facilitatorEmail) {
        facilitators.add(family.facilitatorEmail);
      }
    });
    return Array.from(facilitators);
  }, [families]);
  
  // Get unique grades for filter
  const uniqueGrades = useMemo(() => {
    const grades = new Set();
    processedStudents.forEach(student => {
      if (student.grade) {
        grades.add(student.grade);
      }
    });
    return Array.from(grades).sort((a, b) => {
      // Handle K specially
      if (a === 'K' || a === 'k') return -1;
      if (b === 'K' || b === 'k') return 1;
      return parseInt(a) - parseInt(b);
    });
  }, [processedStudents]);
  
  // Update home education stats when data changes - MUST be before any conditional returns
  useEffect(() => {
    if (setHomeEducationStats) {
      // Since we're now filtering at the database level, the count is simpler
      setHomeEducationStats({
        myFamilies: processedStudents.filter(s => s.facilitatorEmail === (impersonatingFacilitator?.contact?.email || user?.email)).length,
        totalFamilies: Object.keys(families).length
      });
    }
  }, [processedStudents, families, impersonatingFacilitator, user, setHomeEducationStats]);
  
  if (loading || claimsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
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
              <h1 className="text-3xl font-bold text-gray-900">Registrar Dashboard</h1>
              <p className="text-gray-600 mt-1">PASI Registration Management for {activeSchoolYear}</p>
            </div>
          </div>
        </div>
        
        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name, email, ASN, or family..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={filters.facilitator} onValueChange={(value) => setFilters({...filters, facilitator: value})}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Facilitators" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Facilitators</SelectItem>
                  {uniqueFacilitators.map(email => (
                    <SelectItem key={email} value={email}>
                      {email.split('@')[0]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filters.grade} onValueChange={(value) => setFilters({...filters, grade: value})}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="All Grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {uniqueGrades.map(grade => (
                    <SelectItem key={grade} value={grade}>
                      Grade {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filters.missingData} onValueChange={(value) => setFilters({...filters, missingData: value})}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Missing Data" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Data</SelectItem>
                  <SelectItem value="asn">Missing ASN</SelectItem>
                  <SelectItem value="docs">Missing Docs</SelectItem>
                  <SelectItem value="address">Missing Address</SelectItem>
                </SelectContent>
              </Select>
              
            </div>
          </CardContent>
        </Card>
        
        {/* Main Content Tabs */}
        <Card>
          <CardContent className="p-0">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="w-full justify-start rounded-none border-b">
                <TabsTrigger value="queue" className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Queue
                  <Badge variant="secondary" className="ml-1">
                    {processedStudents.filter(s => 
                      s.registrationStatus.status === 'missing-notification' ||
                      s.registrationStatus.status === 'missing-asn'
                    ).length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="ready" className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  Ready for PASI
                  <Badge variant="secondary" className="ml-1">
                    {processedStudents.filter(s => s.registrationStatus.status === 'ready').length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="incomplete" className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Incomplete
                  <Badge variant="secondary" className="ml-1">
                    {processedStudents.filter(s => s.registrationStatus.status === 'incomplete').length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="completed" className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Completed
                  <Badge variant="secondary" className="ml-1">
                    {processedStudents.filter(s => s.registrationStatus.status === 'completed').length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="queue" className="m-0">
                <div className="p-4 space-y-3">
                  {filteredStudents.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No students in queue</p>
                    </div>
                  ) : (
                    filteredStudents.map(student => (
                      <StudentRegistrationCard
                        key={`${student.familyId}-${student.id}`}
                        student={student}
                        familyData={student.familyData}
                        schoolYear={activeSchoolYear}
                        onSelect={() => handleStudentSelect(student)}
                        onMarkRegistered={() => handleMarkAsRegistered(student.id, student.familyId)}
                      />
                    ))
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="ready" className="m-0">
                <div className="p-4 space-y-3">
                  {filteredStudents.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <CheckSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No students ready for PASI registration</p>
                    </div>
                  ) : (
                    filteredStudents.map(student => (
                      <StudentRegistrationCard
                        key={`${student.familyId}-${student.id}`}
                        student={student}
                        familyData={student.familyData}
                        schoolYear={activeSchoolYear}
                        onSelect={() => handleStudentSelect(student)}
                        onMarkRegistered={() => handleMarkAsRegistered(student.id, student.familyId)}
                      />
                    ))
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="incomplete" className="m-0">
                <div className="p-4 space-y-3">
                  {filteredStudents.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No incomplete registrations</p>
                      <p className="text-sm mt-2">Students registered in PASI with missing documentation will appear here</p>
                    </div>
                  ) : (
                    filteredStudents.map(student => (
                      <StudentRegistrationCard
                        key={`${student.familyId}-${student.id}`}
                        student={student}
                        familyData={student.familyData}
                        schoolYear={activeSchoolYear}
                        onSelect={() => handleStudentSelect(student)}
                        onMarkRegistered={() => handleMarkAsRegistered(student.id, student.familyId)}
                      />
                    ))
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="completed" className="m-0">
                <div className="p-4 space-y-3">
                  {filteredStudents.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No completed registrations</p>
                    </div>
                  ) : (
                    filteredStudents.map(student => (
                      <StudentRegistrationCard
                        key={`${student.familyId}-${student.id}`}
                        student={student}
                        familyData={student.familyData}
                        schoolYear={activeSchoolYear}
                        onSelect={() => handleStudentSelect(student)}
                        onMarkRegistered={() => handleMarkAsRegistered(student.id, student.familyId)}
                      />
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Detail Sheet */}
      {selectedStudent && (
        <RegistrationDetailSheet
          isOpen={detailSheetOpen}
          onClose={() => {
            setDetailSheetOpen(false);
            setSelectedStudent(null);
            setSelectedFamily(null);
          }}
          student={selectedStudent}
          familyData={selectedFamily}
          schoolYear={activeSchoolYear}
          onUpdate={() => {
            // Refresh data
          }}
        />
      )}
      
    </div>
  );
};

export default RegistrarDashboard;