import React, { useState, useEffect, useMemo } from 'react';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { 
  Search, 
  RefreshCw, 
  DollarSign, 
  CreditCard,
  AlertCircle,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  Users,
  Eye,
  Clock,
  Calendar,
  User,
  Shield,
  Zap
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import StudentPaymentDetails from './StudentPaymentDetails';
import PaymentActions from './PaymentActions';

const STUDENT_TYPES = [
  { key: 'nonPrimaryStudents', label: 'Non-Primary', color: 'blue', model: 'credit' },
  { key: 'homeEducationStudents', label: 'Home Education', color: 'amber', model: 'credit' },
  { key: 'summerSchoolStudents', label: 'Summer School', color: 'green', model: 'credit' },
  { key: 'adultStudents', label: 'Adult', color: 'purple', model: 'course' },
  { key: 'internationalStudents', label: 'International', color: 'pink', model: 'course' }
];

const PaymentManagementDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('nonPrimaryStudents');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSchoolYear, setSelectedSchoolYear] = useState('25_26');
  const [studentsData, setStudentsData] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    partial: 0,
    unpaid: 0,
    free: 0,
    totalRevenue: 0
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);

  // Load only selected student type data
  useEffect(() => {
    if (!selectedSchoolYear || !selectedType) {
      setStudentsData([]);
      return;
    }

    setLoading(true);
    const db = getDatabase();
    const dataRef = ref(db, `creditsPerStudent/${selectedSchoolYear}/${selectedType}`);
    
    const unsubscribe = onValue(dataRef, async (snapshot) => {
      if (!snapshot.exists()) {
        setStudentsData([]);
        setStats({ total: 0, paid: 0, partial: 0, unpaid: 0, free: 0, totalRevenue: 0 });
        setLoading(false);
        return;
      }

      const students = snapshot.val();
      const allStudents = [];
      let statsData = { total: 0, paid: 0, partial: 0, unpaid: 0, free: 0, totalRevenue: 0 };
      
      const typeInfo = STUDENT_TYPES.find(t => t.key === selectedType);
      if (!typeInfo) {
        setLoading(false);
        return;
      }

      // Process students for the selected type
      for (const [emailKey, studentData] of Object.entries(students)) {
        // Skip only if not an object (could be metadata fields)
        if (!studentData || typeof studentData !== 'object' || studentData === null) continue;
        
        // Skip obvious metadata fields (but be very permissive)
        // Only skip if the key doesn't look like an email
        if (!emailKey.includes('@') && !emailKey.includes(',')) {
          // Check if it might be a metadata field
          if (emailKey === 'lastUpdated' || emailKey === 'count' || emailKey === 'metadata') {
            continue;
          }
        }

        let paymentStatus = 'paid';
        let amountDue = 0;
        let amountPaid = 0;
        let totalCourses = 0;
        let paidCourses = 0;
        let unpaidCourses = 0;

        if (typeInfo.model === 'credit') {
            // Credit-based model (Non-Primary, Home Ed, Summer)
            const totalPaidCredits = studentData.totalPaidCredits || 0;
            const totalCreditsRequiringPayment = studentData.totalCreditsRequiringPayment || 0;
            const totalCredits = studentData.totalCredits || 0;
            const freeCreditsLimit = studentData.freeCreditsLimit || 10;
            
            // Calculate payment status based on actual payments and requirements
            if (totalCredits <= freeCreditsLimit && totalPaidCredits === 0) {
              // Student is within free credit limit and hasn't paid anything
              paymentStatus = 'free'; // Using only free credits
              amountPaid = 0;
              amountDue = 0;
            } else if (totalCreditsRequiringPayment > 0) {
              // Student has credits that still require payment
              if (totalPaidCredits > 0) {
                // Student has made some payments but still owes
                paymentStatus = 'partial';
                amountPaid = totalPaidCredits * 100; // $100 per credit
                amountDue = totalCreditsRequiringPayment * 100;
              } else {
                // No payments made yet but payment is required
                paymentStatus = 'unpaid';
                amountDue = totalCreditsRequiringPayment * 100;
                amountPaid = 0;
              }
            } else if (totalPaidCredits > 0 && totalCreditsRequiringPayment === 0) {
              // Student has paid for all required credits
              paymentStatus = 'paid';
              amountPaid = totalPaidCredits * 100;
              amountDue = 0;
            } else {
              // Edge case: Should not normally happen
              paymentStatus = 'free';
              amountPaid = 0;
              amountDue = 0;
            }
          } else {
            // Course-based model (Adult, International)
            if (studentData.courses && typeof studentData.courses === 'object') {
              // Process each course
              for (const [courseId, courseData] of Object.entries(studentData.courses)) {
                if (typeof courseData === 'object') {
                  totalCourses++;
                  
                  // Check various payment status indicators
                  const isPaid = courseData.isPaid === true || 
                                courseData.paymentStatus === 'paid' || 
                                courseData.paymentStatus === 'active';
                  
                  if (isPaid) {
                    paidCourses++;
                    // Estimate payment amount (can be refined with actual pricing)
                    amountPaid += 300 * 100; // $300 per course default
                  } else {
                    unpaidCourses++;
                    amountDue += 300 * 100; // $300 per course default
                  }
                }
              }
              
              // Use the provided counts if available (more accurate)
              if (studentData.paidCourses !== undefined) {
                paidCourses = studentData.paidCourses;
              }
              if (studentData.unpaidCourses !== undefined) {
                unpaidCourses = studentData.unpaidCourses;
              }
              if (studentData.totalCourses !== undefined) {
                totalCourses = studentData.totalCourses;
              }
              
              // Determine overall payment status
              if (totalCourses > 0) {
                if (paidCourses === totalCourses) {
                  paymentStatus = 'paid';
                } else if (paidCourses > 0) {
                  paymentStatus = 'partial';
                } else {
                  paymentStatus = 'unpaid';
                }
              }
              
              // Override if requiresPayment flag is set
              if (studentData.requiresPayment === false && paidCourses === totalCourses) {
                paymentStatus = 'paid';
              } else if (studentData.requiresPayment === true && paidCourses < totalCourses) {
                paymentStatus = paymentStatus === 'paid' ? 'partial' : paymentStatus;
              }
            } else {
              // No courses found
              paymentStatus = 'paid';
              amountPaid = 0;
              amountDue = 0;
            }
          }

        const studentInfo = {
          email: emailKey.replace(/,/g, '.'),
          uid: studentData.uid || null,
          studentType: studentData.studentType || typeInfo.label,
          typeKey: selectedType,
          paymentModel: typeInfo.model,
            paymentStatus,
            amountDue,
            amountPaid,
            totalCredits: studentData.totalCredits || 0,
            nonExemptCredits: studentData.nonExemptCredits || 0,
            exemptCredits: studentData.exemptCredits || 0,
            freeCreditsUsed: studentData.freeCreditsUsed || 0,
            freeCreditsLimit: studentData.freeCreditsLimit || 10,
            baseFreeCreditsLimit: studentData.baseFreeCreditsLimit || 10,
            additionalFreeCredits: studentData.additionalFreeCredits || 0,
            paidCreditsRequired: studentData.paidCreditsRequired || 0,
            totalPaidCredits: studentData.totalPaidCredits || 0,
            totalCreditsRequiringPayment: studentData.totalCreditsRequiringPayment || 0,
            courses: studentData.courses || {},
            totalCourses: totalCourses || studentData.totalCourses || 0,
            paidCourses: paidCourses || studentData.paidCourses || 0,
            unpaidCourses: unpaidCourses || studentData.unpaidCourses || 0,
            requiresPayment: studentData.requiresPayment || false,
            hasOverrides: studentData.hasOverrides || false,
            overridesApplied: studentData.overridesApplied || [],
            creditsOverrideDetails: studentData.creditsOverrideDetails || null,
            lastUpdated: studentData.lastUpdated || Date.now(),
            rawData: studentData
          };

        allStudents.push(studentInfo);

        // Update stats
        statsData.total++;
        statsData.totalRevenue += amountPaid;
        if (paymentStatus === 'paid') statsData.paid++;
        else if (paymentStatus === 'partial') statsData.partial++;
        else if (paymentStatus === 'free') statsData.free++;
        else statsData.unpaid++;
      }

      setStudentsData(allStudents);
      setStats(statsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedSchoolYear, selectedType]);

  // Filter students based on search and filters
  const filteredStudents = useMemo(() => {
    return studentsData.filter(student => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const emailMatch = student.email.toLowerCase().includes(search);
        const uidMatch = student.uid ? student.uid.toLowerCase().includes(search) : false;
        const typeMatch = student.studentType.toLowerCase().includes(search);
        
        if (!emailMatch && !uidMatch && !typeMatch) {
          return false;
        }
      }

      // Type filter is now handled at data loading level

      // Status filter
      if (selectedStatus !== 'all' && student.paymentStatus !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [studentsData, searchTerm, selectedType, selectedStatus]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const functions = getFunctions();
      const triggerRecalc = httpsCallable(functions, 'triggerMassCreditRecalculation');
      await triggerRecalc();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
    setRefreshing(false);
  };

  const handleUpdateTrialStatuses = async () => {
    setRefreshing(true);
    try {
      const functions = getFunctions();
      const manualUpdateTrialStatuses = httpsCallable(functions, 'manualUpdateTrialPaymentStatuses');
      const result = await manualUpdateTrialStatuses();

      if (result.data?.success) {
        alert('Trial payment statuses updated successfully!');
      } else {
        alert('Failed to update trial payment statuses');
      }
    } catch (error) {
      console.error('Error updating trial statuses:', error);
      alert(`Error: ${error.message}`);
    }
    setRefreshing(false);
  };

  const handleExport = () => {
    try {
      const headers = ['Email', 'Student Type', 'Payment Status', 'Credits/Courses', 'Last Updated'];
      const rows = filteredStudents.map(s => [
        `"${s.email}"`, // Quote email to handle commas
        `"${s.studentType}"`,
        s.paymentStatus === 'free' ? 'Free' : s.paymentStatus.charAt(0).toUpperCase() + s.paymentStatus.slice(1),
        s.paymentModel === 'credit' ? `${s.totalCredits}/${s.freeCreditsLimit}` : `${s.totalCourses} courses`,
        new Date(s.lastUpdated).toLocaleDateString()
      ]);
      
      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export payment data. Please try again.');
    }
  };

  const toggleRowExpansion = (email) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(email)) {
      newExpanded.delete(email);
    } else {
      newExpanded.add(email);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-50';
      case 'partial': return 'text-yellow-600 bg-yellow-50';
      case 'unpaid': return 'text-red-600 bg-red-50';
      case 'free': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };
  
  const getTypeColor = (typeKey) => {
    const colors = {
      nonPrimaryStudents: 'bg-blue-100 text-blue-800',
      homeEducationStudents: 'bg-amber-100 text-amber-800',
      summerSchoolStudents: 'bg-green-100 text-green-800',
      adultStudents: 'bg-purple-100 text-purple-800',
      internationalStudents: 'bg-pink-100 text-pink-800'
    };
    return colors[typeKey] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <Check className="h-4 w-4" />;
      case 'partial': return <Clock className="h-4 w-4" />;
      case 'unpaid': return <X className="h-4 w-4" />;
      case 'free': return <DollarSign className="h-4 w-4 line-through" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-500" />
          <p className="mt-2 text-gray-600">Loading payment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="h-6 w-6" />
          Payment Management Dashboard
        </h2>
        <p className="text-gray-600 mt-1">
          Monitor and manage student payments across all programs
        </p>
        {selectedType && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-gray-500">Currently viewing:</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(selectedType)}`}>
              {STUDENT_TYPES.find(t => t.key === selectedType)?.label} Students
            </span>
            <span className="text-sm text-gray-500">for</span>
            <span className="text-sm font-medium text-gray-700">
              {selectedSchoolYear.replace('_', '/')}
            </span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Free Credits</p>
              <p className="text-2xl font-bold text-blue-600">{stats.free}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-400 opacity-50" />
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Fully Paid</p>
              <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
            </div>
            <Check className="h-8 w-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Partial Payment</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.partial}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unpaid</p>
              <p className="text-2xl font-bold text-red-600">{stats.unpaid}</p>
            </div>
            <X className="h-8 w-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Primary Selection - Year and Student Type */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">School Year</label>
            <select
              value={selectedSchoolYear}
              onChange={(e) => setSelectedSchoolYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="25_26">2025/26</option>
              <option value="24_25">2024/25</option>
              <option value="23_24">2023/24</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              {STUDENT_TYPES.map(type => (
                <option key={type.key} value={type.key}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Secondary Filters */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Status</option>
              <option value="paid">Fully Paid</option>
              <option value="partial">Partial Payment</option>
              <option value="unpaid">Unpaid</option>
              <option value="free">Free Credits Only</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Email or UID..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="flex items-end gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            {/* Show trial update button only for Adult and International students */}
            {(selectedType === 'adultStudents' || selectedType === 'internationalStudents') && (
              <button
                onClick={handleUpdateTrialStatuses}
                disabled={refreshing}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                title="Update trial period statuses and calculate days remaining"
              >
                <Clock className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Update Trials
              </button>
            )}

            <button
              onClick={handleExport}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credits/Courses
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    No students found matching the filters
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <React.Fragment key={student.email}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{student.email}</p>
                          {student.uid ? (
                            <p className="text-xs text-gray-500">UID: {student.uid}</p>
                          ) : (
                            <p className="text-xs text-gray-400 italic">No UID</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(student.typeKey)}`}>
                          {student.studentType}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(student.paymentStatus)}`}>
                            {getStatusIcon(student.paymentStatus)}
                            {student.paymentStatus === 'free' ? 'Free' : student.paymentStatus.charAt(0).toUpperCase() + student.paymentStatus.slice(1)}
                          </span>
                          {student.hasOverrides && (
                            <button
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowActions(true);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors cursor-pointer"
                              title="Click to manage overrides"
                            >
                              <Shield className="h-3 w-3" />
                              Override
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {student.paymentModel === 'credit' ? (
                          <div className="text-sm">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className="font-medium cursor-help inline-flex items-center">
                                    {student.totalCredits - student.exemptCredits} / {student.freeCreditsLimit + student.totalPaidCredits}
                                    {student.additionalFreeCredits > 0 && (
                                      <Zap className="h-3 w-3 text-yellow-600 ml-1" />
                                    )}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent className="bg-gray-900 text-white">
                                  <div className="space-y-1">
                                    <div>Base Free Credits: {student.baseFreeCreditsLimit || 10}</div>
                                    {student.additionalFreeCredits > 0 && (
                                      <div className="text-yellow-400">Override Credits: +{student.additionalFreeCredits}</div>
                                    )}
                                    {student.totalPaidCredits > 0 && (
                                      <div className="text-green-400">Paid Credits: +{student.totalPaidCredits}</div>
                                    )}
                                    <div className="border-t pt-1 mt-1 font-semibold">
                                      Total Limit: {student.freeCreditsLimit + student.totalPaidCredits}
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <p className="text-xs text-gray-500">
                              {(() => {
                                const nonExemptCredits = student.totalCredits - student.exemptCredits;
                                const effectiveLimit = student.freeCreditsLimit + student.totalPaidCredits;
                                if (nonExemptCredits > effectiveLimit) {
                                  return `${nonExemptCredits - effectiveLimit} credits needed`;
                                } else if (nonExemptCredits > student.freeCreditsLimit) {
                                  return `Using ${nonExemptCredits - student.freeCreditsLimit} paid credits`;
                                } else {
                                  return `${student.freeCreditsLimit - nonExemptCredits} free remaining`;
                                }
                              })()}
                            </p>
                          </div>
                        ) : (
                          <div className="text-sm">
                            <p className="font-medium">{student.totalCourses} courses</p>
                            <p className="text-xs text-gray-500">
                              {student.paidCourses} paid, {student.unpaidCourses} unpaid
                            </p>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleRowExpansion(student.email)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Toggle details"
                          >
                            {expandedRows.has(student.email) ? 
                              <ChevronUp className="h-4 w-4" /> : 
                              <ChevronDown className="h-4 w-4" />
                            }
                          </button>
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowDetails(true);
                            }}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="View full details"
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowActions(true);
                            }}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Payment actions"
                          >
                            <DollarSign className="h-4 w-4 text-green-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRows.has(student.email) && (
                      <tr>
                        <td colSpan="5" className="px-4 py-4 bg-gray-50">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            {student.paymentModel === 'credit' ? (
                              <>
                                <div>
                                  <p className="font-medium text-gray-700">Free Credits Used</p>
                                  <p>{student.freeCreditsUsed} / {student.baseFreeCreditsLimit || 10}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-700">Free Credit Limit</p>
                                  <p>
                                    {student.baseFreeCreditsLimit || 10}
                                    {student.additionalFreeCredits > 0 && (
                                      <span className="text-yellow-600"> + {student.additionalFreeCredits} = {student.freeCreditsLimit}</span>
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-700">Paid Credits Required</p>
                                  <p>{student.totalCreditsRequiringPayment || 0}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-700">Paid Credits</p>
                                  <p>{student.totalPaidCredits}</p>
                                </div>
                              </>
                            ) : (
                              <>
                                <div>
                                  <p className="font-medium text-gray-700">Total Courses</p>
                                  <p>{student.totalCourses}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-700">Paid Courses</p>
                                  <p>{student.paidCourses}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-700">Unpaid Courses</p>
                                  <p>{student.unpaidCourses}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-700">Payment Required</p>
                                  <p>{student.requiresPayment ? 'Yes' : 'No'}</p>
                                </div>
                              </>
                            )}
                          </div>
                          {/* Override Details */}
                          {student.hasOverrides && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                              <p className="font-medium text-sm text-yellow-800 mb-2">Active Overrides:</p>
                              {student.creditsOverrideDetails && (
                                <div className="text-xs text-yellow-700">
                                  <p>• Additional Free Credits: +{student.creditsOverrideDetails.additionalFreeCredits}</p>
                                  <p>• New Limit: {student.creditsOverrideDetails.effectiveLimit} (was {student.creditsOverrideDetails.originalLimit})</p>
                                </div>
                              )}
                              {student.overridesApplied && student.overridesApplied.length > 0 && (
                                <div className="text-xs text-yellow-700 mt-2">
                                  {student.overridesApplied.map((override, idx) => (
                                    <div key={idx}>
                                      <p>• Course {override.courseId}: Marked as paid</p>
                                      <p className="ml-2 text-gray-600">Reason: {override.details?.reason}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                          <div className="mt-4 text-xs text-gray-500">
                            Last Updated: {new Date(student.lastUpdated).toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Payment Details Modal */}
      {showDetails && selectedStudent && (
        <StudentPaymentDetails
          student={selectedStudent}
          schoolYear={selectedSchoolYear.replace('_', '/')}
          onClose={() => {
            setShowDetails(false);
            setSelectedStudent(null);
          }}
        />
      )}

      {/* Payment Actions Modal */}
      {showActions && selectedStudent && (
        <PaymentActions
          student={selectedStudent}
          schoolYear={selectedSchoolYear.replace('_', '/')}
          onClose={() => {
            setShowActions(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </div>
  );
};

export default PaymentManagementDashboard;