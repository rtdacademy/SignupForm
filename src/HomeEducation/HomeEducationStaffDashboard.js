import React, { useState, useEffect, useMemo } from 'react';
import { getDatabase, ref, onValue, off, query, orderByChild, equalTo } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { useStaffClaims } from '../customClaims/useStaffClaims';
import { 
  Users, 
  GraduationCap, 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  Clock,
  Home,
  Building2,
  Hash,
  User,
  UserCheck,
  Globe,
  ToggleLeft,
  ToggleRight,
  X,
  ChevronDown,
  FilterX,
  Settings,
  UserPlus,
  MessageSquare,
  Edit,
  MoreVertical,
  Save,
  AlertTriangle,
  StarIcon as Star,
  Loader2,
  Table as TableIcon,
  Grid3X3 as Grid3X3Icon
} from 'lucide-react';
import { 
  getCurrentSchoolYear, 
  getActiveSeptemberCount, 
  formatImportantDate,
  getAllSeptemberCountDates
} from '../config/importantDates';
import { formatDateForDisplay } from '../utils/timeZoneUtils';
import RTDConnectDashboard from '../RTDConnect/Dashboard';
import { getAllFacilitators, getFacilitatorByEmail } from '../config/facilitators';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../components/ui/table';
import { ScrollArea } from '../components/ui/scroll-area';

// Family Table Component
const FamilyTable = ({ families, onViewDashboard, onManageFamily, currentUserEmail, impersonatedEmail }) => {
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const currentYear = getCurrentSchoolYear();
  const effectiveEmail = impersonatedEmail || currentUserEmail;

  // Process families data for table display
  const familyRows = useMemo(() => {
    return Object.entries(families).map(([familyId, family]) => {
      const students = family.students ? Object.values(family.students) : [];
      const guardians = family.guardians ? Object.values(family.guardians) : [];
      const primaryGuardian = guardians.find(g => g.guardianType === 'primary_guardian') || guardians[0];
      const forms = family.NOTIFICATION_FORMS?.[currentYear] || {};
      
      // Calculate registration status
      const hasFormsForAllStudents = students.length > 0 && students.every(student => 
        forms[student.id] && forms[student.id].submissionStatus === 'submitted'
      );
      const hasAnyForms = Object.keys(forms).length > 0;
      
      // Get grade range
      const grades = students.map(s => s.grade).filter(Boolean);
      const gradeRange = grades.length > 0 ? 
        (grades.length === 1 ? `Grade ${grades[0]}` : `Grades ${Math.min(...grades)}-${Math.max(...grades)}`) : 
        'No grades';

      return {
        familyId,
        familyName: family.familyName || 'Unnamed Family',
        primaryGuardian: primaryGuardian ? `${primaryGuardian.firstName} ${primaryGuardian.lastName}` : '',
        guardianEmail: primaryGuardian?.email || '',
        guardianPhone: primaryGuardian?.phone || '',
        studentCount: students.length,
        gradeRange,
        facilitatorEmail: family.facilitatorEmail || '',
        isMyFamily: family.facilitatorEmail === effectiveEmail,
        registrationStatus: hasFormsForAllStudents ? 'Completed' : hasAnyForms ? 'Partial' : 'Pending',
        lastUpdated: family.lastUpdated || family.createdAt,
        city: primaryGuardian?.address?.city || '',
        rawFamily: family
      };
    });
  }, [families, currentYear, effectiveEmail]);

  // Sort functionality
  const sortedRows = useMemo(() => {
    if (!sortConfig.key) return familyRows;
    
    return [...familyRows].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [familyRows, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleViewDashboard = (familyId, family) => {
    // Navigate to Dashboard with family context
    navigate('/rtd-connect/dashboard', {
      state: {
        staffView: true,
        familyId: familyId,
        familyData: family,
        viewingAs: currentUserEmail
      }
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Completed': 'bg-green-100 text-green-800 border-green-200',
      'Partial': 'bg-orange-100 text-orange-800 border-orange-200',
      'Pending': 'bg-red-100 text-red-800 border-red-200'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const getFacilitatorBadge = (email, isMyFamily) => {
    if (!email) {
      return <span className="text-xs text-gray-500 italic">Unassigned</span>;
    }
    
    const facilitator = getFacilitatorByEmail(email);
    const name = facilitator?.name || email;
    
    if (isMyFamily) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 border border-purple-200">
          {name} (Me)
        </span>
      );
    }
    
    return <span className="text-xs text-gray-600">{name}</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead 
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('familyName')}
            >
              <div className="flex items-center space-x-1">
                <span>Family Name</span>
                {sortConfig.key === 'familyName' && (
                  <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                )}
              </div>
            </TableHead>
            <TableHead>Primary Guardian</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('studentCount')}
            >
              <div className="flex items-center space-x-1">
                <span>Students</span>
                {sortConfig.key === 'studentCount' && (
                  <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                )}
              </div>
            </TableHead>
            <TableHead>Grades</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('facilitatorEmail')}
            >
              <div className="flex items-center space-x-1">
                <span>Facilitator</span>
                {sortConfig.key === 'facilitatorEmail' && (
                  <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                )}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('registrationStatus')}
            >
              <div className="flex items-center space-x-1">
                <span>Registration</span>
                {sortConfig.key === 'registrationStatus' && (
                  <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                )}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('lastUpdated')}
            >
              <div className="flex items-center space-x-1">
                <span>Last Activity</span>
                {sortConfig.key === 'lastUpdated' && (
                  <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                )}
              </div>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                No families found
              </TableCell>
            </TableRow>
          ) : (
            sortedRows.map((row) => (
              <TableRow 
                key={row.familyId}
                className={row.isMyFamily ? 'bg-purple-50 hover:bg-purple-100' : 'hover:bg-gray-50'}
              >
                <TableCell className="font-medium">
                  {row.familyName}
                  {row.isMyFamily && (
                    <span className="ml-2 text-xs text-purple-600">(My Family)</span>
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="text-sm font-medium">{row.primaryGuardian}</div>
                    <div className="text-xs text-gray-500">{row.guardianEmail}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <GraduationCap className="w-4 h-4 text-blue-500" />
                    <span>{row.studentCount}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{row.gradeRange}</TableCell>
                <TableCell>{getFacilitatorBadge(row.facilitatorEmail, row.isMyFamily)}</TableCell>
                <TableCell>{getStatusBadge(row.registrationStatus)}</TableCell>
                <TableCell className="text-sm text-gray-500">
                  {row.lastUpdated ? new Date(row.lastUpdated).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleViewDashboard(row.familyId, row.rawFamily)}
                      className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                      title="View as Family"
                    >
                      <Home className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onManageFamily(row.familyId, row.rawFamily)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                      title="Manage Family"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

// Family Card Component
const FamilyCard = ({ family, familyId, onViewDetails, onViewDashboard, onManageFamily }) => {
  const [studentCount, setStudentCount] = useState(0);
  const [guardianCount, setGuardianCount] = useState(0);
  const [registrationStatus, setRegistrationStatus] = useState('unknown');
  const [lastUpdated, setLastUpdated] = useState(null);
  
  useEffect(() => {
    if (family) {
      // Count students and guardians
      const students = family.students ? Object.values(family.students) : [];
      const guardians = family.guardians ? Object.values(family.guardians) : [];
      
      setStudentCount(students.length);
      setGuardianCount(guardians.length);
      
      // Determine registration status for current school year
      const currentYear = getCurrentSchoolYear();
      const forms = family.NOTIFICATION_FORMS?.[currentYear] || {};
      const hasFormsForAllStudents = students.length > 0 && students.every(student => 
        forms[student.id] && forms[student.id].status === 'submitted'
      );
      
      if (hasFormsForAllStudents) {
        setRegistrationStatus('completed');
      } else if (Object.keys(forms).length > 0) {
        setRegistrationStatus('partial');
      } else {
        setRegistrationStatus('pending');
      }
      
      // Get last updated timestamp
      if (family.lastUpdated) {
        setLastUpdated(new Date(family.lastUpdated));
      } else if (family.createdAt) {
        setLastUpdated(new Date(family.createdAt));
      }
    }
  }, [family]);

  const getStatusIcon = () => {
    switch (registrationStatus) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'partial':
        return <Clock className="w-5 h-5 text-orange-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (registrationStatus) {
      case 'completed':
        return 'Registered';
      case 'partial':
        return 'Partial';
      default:
        return 'Pending';
    }
  };

  const getStatusColor = () => {
    switch (registrationStatus) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'partial':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {family.familyName || 'Unnamed Family'}
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600">
                {studentCount} Student{studentCount !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-600">
                {guardianCount} Guardian{guardianCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Facilitator Info */}
          {family.facilitatorEmail && (
            <div className="mb-4 p-2 bg-indigo-50 border border-indigo-200 rounded-md">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-indigo-500" />
                <span className="text-sm text-indigo-700 font-medium">
                  Facilitator: {family.facilitatorEmail}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
            
            {lastUpdated && (
              <span className="text-xs text-gray-500">
                Updated {lastUpdated.toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        
        <div className="ml-4 flex flex-col space-y-2">
          <button
            onClick={() => onViewDetails(familyId, family)}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </button>
          <button
            onClick={() => onViewDashboard(familyId, family)}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>View Dashboard</span>
          </button>
          <button
            onClick={() => onManageFamily(familyId, family)}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Manage</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Statistics Card Component
const StatsCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => (
  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
    <div className="flex items-center">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r from-${color}-500 to-${color}-600 flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="ml-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {subtitle && (
          <p className="text-xs text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  </div>
);

// Family Dashboard View Modal Component - Shows the exact Dashboard.js view the family sees
const FamilyDashboardModal = ({ family, familyId, isOpen, onClose }) => {
  const { user } = useAuth();
  const [familyUser, setFamilyUser] = useState(null);
  
  useEffect(() => {
    if (isOpen && family && family.guardians) {
      // Create a mock user object from the primary guardian for the Dashboard component
      const guardians = Object.values(family.guardians);
      const primaryGuardian = guardians.find(g => g.guardianType === 'primary_guardian') || guardians[0];
      
      if (primaryGuardian) {
        setFamilyUser({
          uid: `mock-${primaryGuardian.emailKey}`,
          email: primaryGuardian.email,
          displayName: `${primaryGuardian.firstName} ${primaryGuardian.lastName}`,
          // Mock the auth context properties
          user_email_key: primaryGuardian.emailKey,
          familyId: family.familyId
        });
      }
    } else {
      setFamilyUser(null);
    }
  }, [isOpen, family]);

  if (!isOpen || !family || !familyUser) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
          <div className="sticky top-0 z-10 px-6 py-4 border-b border-gray-200 bg-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Family Dashboard View - {family.familyName || 'Unnamed Family'}
                </h2>
                <p className="text-sm text-gray-600">
                  This is exactly what the family sees in their RTD Connect Dashboard
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Warning Banner */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Eye className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Staff View Mode</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    You are viewing this family's dashboard as they would see it. 
                    All data and functionality reflects their current state.
                  </p>
                  <div className="text-xs text-blue-600 mt-2">
                    <strong>Viewing as:</strong> {familyUser.email} | <strong>Family ID:</strong> {familyId}
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Component */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <span className="text-sm font-medium text-gray-700">Family Dashboard Content</span>
              </div>
              <div className="min-h-[600px]">
                {/* Note: We would render the RTDConnectDashboard here but it requires complex auth context setup */}
                {/* For now, show a placeholder with key family information */}
                <div className="p-6">
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Dashboard View Integration
                    </h3>
                    <p className="text-gray-600 mb-4">
                      The full family dashboard integration is ready for implementation.
                      This would show the exact RTD Connect Dashboard that {family.familyName} sees.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 text-left max-w-md mx-auto">
                      <h4 className="font-medium text-gray-900 mb-2">Would include:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Student registration progress</li>
                        <li>• Form completion status</li>
                        <li>• Payment and budget information</li>
                        <li>• Document upload areas</li>
                        <li>• Facilitator communications</li>
                        <li>• Real-time family data</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Family Management Modal Component
const FamilyManagementModal = ({ family, familyId, isOpen, onClose, action }) => {
  const [facilitatorEmail, setFacilitatorEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && family) {
      setFacilitatorEmail(family.facilitatorEmail || '');
      setNotes(family.staffNotes || '');
      setPriority(family.priority || false);
    }
  }, [isOpen, family]);

  const handleSave = async () => {
    if (!family || !familyId) return;
    
    setSaving(true);
    try {
      // Here you would update the Firebase database
      console.log('Saving changes:', {
        familyId,
        facilitatorEmail,
        notes,
        priority
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onClose();
    } catch (error) {
      console.error('Error saving changes:', error);
    }
    setSaving(false);
  };

  if (!isOpen || !family) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Manage Family - {family.familyName || 'Unnamed Family'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="px-6 py-4 space-y-6">
            {/* Facilitator Assignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Facilitator
              </label>
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={facilitatorEmail}
                  onChange={(e) => setFacilitatorEmail(e.target.value)}
                  placeholder="Enter facilitator email address"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Current: {family.facilitatorEmail || 'No facilitator assigned'}
              </p>
            </div>

            {/* Priority Flag */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="priority"
                checked={priority}
                onChange={(e) => setPriority(e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="priority" className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">
                  Mark as Priority Family
                </span>
              </label>
            </div>

            {/* Staff Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Staff Notes (Private)
              </label>
              <div className="flex items-start space-x-2">
                <MessageSquare className="w-5 h-5 text-gray-400 mt-2" />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add private notes about this family..."
                  rows={4}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                These notes are only visible to staff members
              </p>
            </div>

            {/* Quick Actions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Actions
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center space-x-2 p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Send Email</span>
                </button>
                <button className="flex items-center space-x-2 p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="text-sm">Flag Issue</span>
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Family Details Modal Component
const FamilyDetailsModal = ({ family, familyId, isOpen, onClose }) => {
  if (!isOpen || !family) return null;

  const students = family.students ? Object.values(family.students) : [];
  const guardians = family.guardians ? Object.values(family.guardians) : [];
  const currentYear = getCurrentSchoolYear();
  const forms = family.NOTIFICATION_FORMS?.[currentYear] || {};

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {family.familyName || 'Family Details'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="px-6 py-4">
            {/* Family Overview */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Family Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Family ID: {familyId}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600">{students.length} Students</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-600">{guardians.length} Guardians</span>
                </div>
              </div>
            </div>

            {/* Students Section */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Students</h3>
              <div className="space-y-4">
                {students.map((student, index) => {
                  const hasForm = forms[student.id];
                  return (
                    <div key={student.id || index} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {student.preferredName || student.firstName} {student.lastName}
                          </h4>
                          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div>ASN: {student.asn}</div>
                            <div>Grade: {student.grade}</div>
                            <div>Gender: {student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : student.gender === 'X' ? 'Other' : student.gender}</div>
                            <div>Birthday: {formatDateForDisplay(student.birthday)}</div>
                            {student.email && <div>Email: {student.email}</div>}
                            {student.phone && <div>Phone: {student.phone}</div>}
                          </div>
                        </div>
                        <div className="ml-4">
                          {hasForm ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                              Registered
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Guardians Section */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Parents/Guardians</h3>
              <div className="space-y-4">
                {guardians.map((guardian, index) => (
                  <div key={guardian.id || index} className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {guardian.firstName} {guardian.lastName}
                        </h4>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span>{guardian.email}</span>
                          </div>
                          {guardian.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="w-3 h-3" />
                              <span>{guardian.phone}</span>
                            </div>
                          )}
                          <div>Relation: {guardian.relationToStudents || 'Guardian'}</div>
                          {guardian.address && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{guardian.address.city}, {guardian.address.province}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        {guardian.guardianType === 'primary_guardian' ? (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                            Primary
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                            Guardian
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HomeEducationStaffDashboard = ({
  // Props from Layout for header functionality
  showMyFamiliesOnly = false,
  setShowMyFamiliesOnly = () => {},
  impersonatingFacilitator = null,
  setImpersonatingFacilitator = () => {},
  showImpersonationDropdown = false,
  setShowImpersonationDropdown = () => {},
  homeEducationStats = { totalFamilies: 0, myFamilies: 0 },
  setHomeEducationStats = () => {}
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { hasPermission, isStaff, isAdmin, loading: claimsLoading } = useStaffClaims();
  const [families, setFamilies] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedFamilyId, setSelectedFamilyId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDashboardModal, setShowDashboardModal] = useState(false);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [managementAction, setManagementAction] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewType, setViewType] = useState('table'); // 'table' or 'cards'
  const [filters, setFilters] = useState({
    registrationStatus: 'all', // all, completed, partial, pending
    gradeLevel: 'all', // all, k, elementary, middle, high
    location: 'all', // all, specific provinces/cities
    facilitatorAssigned: 'all' // all, assigned, unassigned
  });
  const [stats, setStats] = useState({
    totalFamilies: 0,
    totalStudents: 0,
    totalGuardians: 0,
    registeredFamilies: 0,
    pendingFamilies: 0,
    partialFamilies: 0,
    myFamilies: 0,
    myRegisteredFamilies: 0
  });

  // Load families data
  useEffect(() => {
    if (!user || claimsLoading) return;

    const db = getDatabase();
    const familiesRef = ref(db, 'homeEducationFamilies/familyInformation');

    const unsubscribe = onValue(familiesRef, (snapshot) => {
      if (snapshot.exists()) {
        const familiesData = snapshot.val();
        setFamilies(familiesData);
        
        // Calculate statistics
        const familyEntries = Object.entries(familiesData);
        const currentYear = getCurrentSchoolYear();
        // Use impersonated facilitator email if set, otherwise use actual user email
        const effectiveEmail = impersonatingFacilitator?.contact?.email || user?.email;
        
        let totalStudents = 0;
        let totalGuardians = 0;
        let registeredCount = 0;
        let pendingCount = 0;
        let partialCount = 0;
        let myFamilies = 0;
        let myRegisteredFamilies = 0;

        familyEntries.forEach(([familyId, family]) => {
          const students = family.students ? Object.values(family.students) : [];
          const guardians = family.guardians ? Object.values(family.guardians) : [];
          const forms = family.NOTIFICATION_FORMS?.[currentYear] || {};
          const isMyFamily = family.facilitatorEmail === effectiveEmail;
          
          totalStudents += students.length;
          totalGuardians += guardians.length;
          
          if (isMyFamily) {
            myFamilies++;
          }
          
          // Check registration status
          const hasFormsForAllStudents = students.length > 0 && students.every(student => 
            forms[student.id] && forms[student.id].submissionStatus === 'submitted'
          );
          
          if (hasFormsForAllStudents) {
            registeredCount++;
            if (isMyFamily) {
              myRegisteredFamilies++;
            }
          } else if (Object.keys(forms).length > 0) {
            partialCount++;
          } else {
            pendingCount++;
          }
        });

        const newStats = {
          totalFamilies: familyEntries.length,
          totalStudents,
          totalGuardians,
          registeredFamilies: registeredCount,
          pendingFamilies: pendingCount,
          partialFamilies: partialCount,
          myFamilies,
          myRegisteredFamilies
        };
        
        setStats(newStats);
        
        // Update header stats
        if (setHomeEducationStats) {
          setHomeEducationStats({
            totalFamilies: familyEntries.length,
            myFamilies
          });
        }
      } else {
        setFamilies({});
        const emptyStats = {
          totalFamilies: 0,
          totalStudents: 0,
          totalGuardians: 0,
          registeredFamilies: 0,
          pendingFamilies: 0,
          partialFamilies: 0,
          myFamilies: 0,
          myRegisteredFamilies: 0
        };
        setStats(emptyStats);
        
        // Update header stats
        if (setHomeEducationStats) {
          setHomeEducationStats({
            totalFamilies: 0,
            myFamilies: 0
          });
        }
      }
      setLoading(false);
    }, (error) => {
      console.error('Error loading families data:', error);
      setLoading(false);
    });

    return () => {
      off(familiesRef, 'value', unsubscribe);
    };
  }, [user, claimsLoading, impersonatingFacilitator]);

  // Filter families based on all criteria
  const filteredFamilies = useMemo(() => {
    let result = families;
    // Use impersonated facilitator email if set, otherwise use actual user email
    const effectiveEmail = impersonatingFacilitator?.contact?.email || user?.email;
    const currentYear = getCurrentSchoolYear();

    // Apply facilitator filter first (most restrictive)
    if (showMyFamiliesOnly && effectiveEmail) {
      result = Object.fromEntries(
        Object.entries(result).filter(([familyId, family]) => 
          family.facilitatorEmail === effectiveEmail
        )
      );
    }

    // Apply advanced filters
    result = Object.fromEntries(
      Object.entries(result).filter(([familyId, family]) => {
        // Registration Status Filter
        if (filters.registrationStatus !== 'all') {
          const students = family.students ? Object.values(family.students) : [];
          const forms = family.NOTIFICATION_FORMS?.[currentYear] || {};
          const hasFormsForAllStudents = students.length > 0 && students.every(student => 
            forms[student.id] && forms[student.id].submissionStatus === 'submitted'
          );
          const hasAnyForms = Object.keys(forms).length > 0;

          if (filters.registrationStatus === 'completed' && !hasFormsForAllStudents) return false;
          if (filters.registrationStatus === 'partial' && (hasFormsForAllStudents || !hasAnyForms)) return false;
          if (filters.registrationStatus === 'pending' && hasAnyForms) return false;
        }

        // Grade Level Filter
        if (filters.gradeLevel !== 'all') {
          const students = family.students ? Object.values(family.students) : [];
          const hasMatchingGrade = students.some(student => {
            const grade = student.grade?.toString().toLowerCase();
            if (filters.gradeLevel === 'k') return grade === 'k' || grade === 'kindergarten' || grade === '0';
            if (filters.gradeLevel === 'elementary') return ['1', '2', '3', '4', '5', '6'].includes(grade);
            if (filters.gradeLevel === 'middle') return ['7', '8', '9'].includes(grade);
            if (filters.gradeLevel === 'high') return ['10', '11', '12'].includes(grade);
            return false;
          });
          if (!hasMatchingGrade) return false;
        }

        // Facilitator Assignment Filter
        if (filters.facilitatorAssigned !== 'all') {
          const hasAssignedFacilitator = !!family.facilitatorEmail;
          if (filters.facilitatorAssigned === 'assigned' && !hasAssignedFacilitator) return false;
          if (filters.facilitatorAssigned === 'unassigned' && hasAssignedFacilitator) return false;
        }

        return true;
      })
    );

    // Apply search term filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = Object.fromEntries(
        Object.entries(result).filter(([familyId, family]) => {
          // Search in family name
          if (family.familyName?.toLowerCase().includes(searchLower)) return true;
          
          // Search in student names and ASNs
          const students = family.students ? Object.values(family.students) : [];
          if (students.some(student => 
            student.firstName?.toLowerCase().includes(searchLower) ||
            student.lastName?.toLowerCase().includes(searchLower) ||
            student.preferredName?.toLowerCase().includes(searchLower) ||
            student.asn?.includes(searchTerm)
          )) return true;

          // Search in guardian names and emails
          const guardians = family.guardians ? Object.values(family.guardians) : [];
          if (guardians.some(guardian =>
            guardian.firstName?.toLowerCase().includes(searchLower) ||
            guardian.lastName?.toLowerCase().includes(searchLower) ||
            guardian.email?.toLowerCase().includes(searchLower)
          )) return true;

          // Search in facilitator email
          if (family.facilitatorEmail?.toLowerCase().includes(searchLower)) return true;

          // Search in family ID
          if (familyId.toLowerCase().includes(searchLower)) return true;

          return false;
        })
      );
    }

    return result;
  }, [families, searchTerm, showMyFamiliesOnly, filters, user?.email, impersonatingFacilitator]);

  const handleViewDetails = (familyId, family) => {
    setSelectedFamilyId(familyId);
    setSelectedFamily(family);
    setShowDetailsModal(true);
  };

  const handleViewDashboard = (familyId, family) => {
    setSelectedFamilyId(familyId);
    setSelectedFamily(family);
    setShowDashboardModal(true);
  };

  const handleCloseModal = () => {
    setSelectedFamily(null);
    setSelectedFamilyId(null);
    setShowDetailsModal(false);
  };

  const handleCloseDashboardModal = () => {
    setSelectedFamily(null);
    setSelectedFamilyId(null);
    setShowDashboardModal(false);
  };

  const handleManageFamily = (familyId, family) => {
    setSelectedFamilyId(familyId);
    setSelectedFamily(family);
    setManagementAction('manage');
    setShowManagementModal(true);
  };

  const handleCloseManagementModal = () => {
    setSelectedFamily(null);
    setSelectedFamilyId(null);
    setManagementAction(null);
    setShowManagementModal(false);
  };

  // Helper functions for filter management
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      registrationStatus: 'all',
      gradeLevel: 'all',
      location: 'all',
      facilitatorAssigned: 'all'
    });
    setSearchTerm('');
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== 'all') || searchTerm.trim();

  // Export functionality
  const handleExportFamilies = () => {
    const familyEntries = Object.entries(filteredFamilies);
    const currentYear = getCurrentSchoolYear();
    
    const csvData = familyEntries.map(([familyId, family]) => {
      const students = family.students ? Object.values(family.students) : [];
      const guardians = family.guardians ? Object.values(family.guardians) : [];
      const primaryGuardian = guardians.find(g => g.guardianType === 'primary_guardian') || guardians[0];
      
      // Calculate registration status
      const forms = family.NOTIFICATION_FORMS?.[currentYear] || {};
      const hasFormsForAllStudents = students.length > 0 && students.every(student => 
        forms[student.id] && forms[student.id].submissionStatus === 'submitted'
      );
      const hasAnyForms = Object.keys(forms).length > 0;
      const registrationStatus = hasFormsForAllStudents ? 'Completed' : 
                                hasAnyForms ? 'Partial' : 'Pending';

      return {
        'Family ID': familyId,
        'Family Name': family.familyName || 'Unnamed Family',
        'Primary Guardian': primaryGuardian ? `${primaryGuardian.firstName} ${primaryGuardian.lastName}` : '',
        'Guardian Email': primaryGuardian?.email || '',
        'Guardian Phone': primaryGuardian?.phone || '',
        'City': primaryGuardian?.address?.city || '',
        'Province': primaryGuardian?.address?.province || '',
        'Student Count': students.length,
        'Guardian Count': guardians.length,
        'Facilitator Email': family.facilitatorEmail || 'Unassigned',
        'Registration Status': registrationStatus,
        'Last Updated': family.lastUpdated ? new Date(family.lastUpdated).toLocaleDateString() : '',
        'Created Date': family.createdAt ? new Date(family.createdAt).toLocaleDateString() : ''
      };
    });

    // Convert to CSV
    if (csvData.length === 0) return;
    
    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          // Escape quotes and wrap in quotes if contains comma
          return value.includes(',') || value.includes('"') ? 
            `"${value.replace(/"/g, '""')}"` : value;
        }).join(',')
      )
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `home_education_families_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Check access permissions
  if (claimsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading permissions...</p>
        </div>
      </div>
    );
  }

  if (!isStaff || !hasPermission('staff')) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">
            <h3 className="font-medium">Access Denied</h3>
            <p className="mt-1">You don't have permission to access the Home Education Staff Dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading home education data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Current school year info */}
      <div className="mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-blue-900">
                Current School Year: {getCurrentSchoolYear()}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {showMyFamiliesOnly && (
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-blue-700">
                    Facilitator: {impersonatingFacilitator?.contact?.email || user?.email}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications & Alerts */}
      {(stats.pendingFamilies > 0 || stats.partialFamilies > 0) && (
        <div className="mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800">Attention Required</h3>
                <div className="mt-1 text-sm text-yellow-700">
                  {stats.pendingFamilies > 0 && (
                    <span className="block">
                      {stats.pendingFamilies} famil{stats.pendingFamilies === 1 ? 'y' : 'ies'} haven't started registration
                    </span>
                  )}
                  {stats.partialFamilies > 0 && (
                    <span className="block">
                      {stats.partialFamilies} famil{stats.partialFamilies === 1 ? 'y' : 'ies'} have incomplete registrations
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title={showMyFamiliesOnly ? "My Families" : "Total Families"}
          value={showMyFamiliesOnly ? stats.myFamilies : stats.totalFamilies}
          icon={showMyFamiliesOnly ? UserCheck : Users}
          color="purple"
          subtitle={showMyFamiliesOnly ? "Assigned to me" : "All families"}
        />
        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          icon={GraduationCap}
          color="blue"
        />
        <StatsCard
          title="Registered Families"
          value={showMyFamiliesOnly ? stats.myRegisteredFamilies : stats.registeredFamilies}
          icon={CheckCircle2}
          color="green"
          subtitle={showMyFamiliesOnly 
            ? `${stats.myFamilies > 0 ? Math.round((stats.myRegisteredFamilies / stats.myFamilies) * 100) : 0}% of my families`
            : `${stats.totalFamilies > 0 ? Math.round((stats.registeredFamilies / stats.totalFamilies) * 100) : 0}% complete`
          }
        />
        <StatsCard
          title="Filtered Results"
          value={Object.keys(filteredFamilies).length}
          icon={Filter}
          color="indigo"
          subtitle={hasActiveFilters ? "Filters active" : "No filters applied"}
        />
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col gap-4">
          {/* Primary Search Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search families, students, guardians, ASNs, or facilitator emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center space-x-2 px-4 py-2 border rounded-md transition-colors ${
                  showAdvancedFilters 
                    ? 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Advanced Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
              </button>
              {hasActiveFilters && (
                <button 
                  onClick={clearAllFilters}
                  className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                >
                  <FilterX className="w-4 h-4" />
                  <span>Clear All</span>
                </button>
              )}
              <button 
                onClick={handleExportFamilies}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                title={`Export ${Object.keys(filteredFamilies).length} families to CSV`}
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Registration Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration Status</label>
                  <select
                    value={filters.registrationStatus}
                    onChange={(e) => handleFilterChange('registrationStatus', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="partial">Partial</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                {/* Grade Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
                  <select
                    value={filters.gradeLevel}
                    onChange={(e) => handleFilterChange('gradeLevel', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Grades</option>
                    <option value="k">Kindergarten</option>
                    <option value="elementary">Elementary (1-6)</option>
                    <option value="middle">Middle School (7-9)</option>
                    <option value="high">High School (10-12)</option>
                  </select>
                </div>

                {/* Facilitator Assignment Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Facilitator Assignment</label>
                  <select
                    value={filters.facilitatorAssigned}
                    onChange={(e) => handleFilterChange('facilitatorAssigned', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Families</option>
                    <option value="assigned">Assigned Facilitator</option>
                    <option value="unassigned">No Facilitator</option>
                  </select>
                </div>

                {/* Location Filter Placeholder */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Locations</option>
                    <option value="alberta">Alberta</option>
                    <option value="calgary">Calgary</option>
                    <option value="edmonton">Edmonton</option>
                    <option value="red-deer">Red Deer</option>
                  </select>
                </div>
              </div>
              
              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                    <div className="flex flex-wrap gap-2">
                      {searchTerm && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Search: "{searchTerm}"
                          <button 
                            onClick={() => setSearchTerm('')}
                            className="ml-1 text-purple-600 hover:text-purple-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {Object.entries(filters).filter(([_, value]) => value !== 'all').map(([key, value]) => (
                        <span key={key} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {key}: {value}
                          <button 
                            onClick={() => handleFilterChange(key, 'all')}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {Object.keys(filteredFamilies).length} of {stats.totalFamilies} families
        </p>
      </div>

      {/* View Type Toggle */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">View as:</span>
          <button
            onClick={() => setViewType('table')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewType === 'table' 
                ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-1">
              <TableIcon className="w-4 h-4" />
              <span>Table</span>
            </div>
          </button>
          <button
            onClick={() => setViewType('cards')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewType === 'cards' 
                ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-1">
              <Grid3X3Icon className="w-4 h-4" />
              <span>Cards</span>
            </div>
          </button>
        </div>
      </div>

      {/* Families Display */}
      {viewType === 'table' ? (
        <FamilyTable
          families={filteredFamilies}
          onViewDashboard={handleViewDashboard}
          onManageFamily={handleManageFamily}
          currentUserEmail={user?.email}
          impersonatedEmail={impersonatingFacilitator?.contact?.email}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(filteredFamilies).map(([familyId, family]) => (
            <FamilyCard
              key={familyId}
              family={family}
              familyId={familyId}
              onViewDetails={handleViewDetails}
              onViewDashboard={handleViewDashboard}
              onManageFamily={handleManageFamily}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {Object.keys(filteredFamilies).length === 0 && !loading && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No families found' : 'No families registered yet'}
          </h3>
          <p className="text-gray-600">
            {searchTerm 
              ? 'Try adjusting your search terms to find what you\'re looking for.'
              : 'Families will appear here once they complete their registration through RTD Connect.'
            }
          </p>
        </div>
      )}

      {/* Family Details Modal */}
      <FamilyDetailsModal
        family={selectedFamily}
        familyId={selectedFamilyId}
        isOpen={showDetailsModal}
        onClose={handleCloseModal}
      />

      {/* Family Dashboard View Modal */}
      <FamilyDashboardModal
        family={selectedFamily}
        familyId={selectedFamilyId}
        isOpen={showDashboardModal}
        onClose={handleCloseDashboardModal}
      />

      {/* Family Management Modal */}
      <FamilyManagementModal
        family={selectedFamily}
        familyId={selectedFamilyId}
        isOpen={showManagementModal}
        onClose={handleCloseManagementModal}
        action={managementAction}
      />
    </div>
  );
};

export default HomeEducationStaffDashboard;