import React, { useState, useEffect, useMemo } from 'react';
import { getDatabase, ref, onValue, off } from 'firebase/database';
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
  User
} from 'lucide-react';
import { 
  getCurrentSchoolYear, 
  getActiveSeptemberCount, 
  formatImportantDate,
  getAllSeptemberCountDates
} from '../config/importantDates';

// Family Card Component
const FamilyCard = ({ family, familyId, onViewDetails }) => {
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
        
        <div className="ml-4">
          <button
            onClick={() => onViewDetails(familyId, family)}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
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
                            <div>Birthday: {new Date(student.birthday).toLocaleDateString()}</div>
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

const HomeEducationStaffDashboard = () => {
  const { user } = useAuth();
  const { hasPermission, isStaff, loading: claimsLoading } = useStaffClaims();
  const [families, setFamilies] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedFamilyId, setSelectedFamilyId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    totalFamilies: 0,
    totalStudents: 0,
    totalGuardians: 0,
    registeredFamilies: 0,
    pendingFamilies: 0,
    partialFamilies: 0
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
        
        let totalStudents = 0;
        let totalGuardians = 0;
        let registeredCount = 0;
        let pendingCount = 0;
        let partialCount = 0;

        familyEntries.forEach(([familyId, family]) => {
          const students = family.students ? Object.values(family.students) : [];
          const guardians = family.guardians ? Object.values(family.guardians) : [];
          const forms = family.NOTIFICATION_FORMS?.[currentYear] || {};
          
          totalStudents += students.length;
          totalGuardians += guardians.length;
          
          // Check registration status
          const hasFormsForAllStudents = students.length > 0 && students.every(student => 
            forms[student.id] && forms[student.id].status === 'submitted'
          );
          
          if (hasFormsForAllStudents) {
            registeredCount++;
          } else if (Object.keys(forms).length > 0) {
            partialCount++;
          } else {
            pendingCount++;
          }
        });

        setStats({
          totalFamilies: familyEntries.length,
          totalStudents,
          totalGuardians,
          registeredFamilies: registeredCount,
          pendingFamilies: pendingCount,
          partialFamilies: partialCount
        });
      } else {
        setFamilies({});
        setStats({
          totalFamilies: 0,
          totalStudents: 0,
          totalGuardians: 0,
          registeredFamilies: 0,
          pendingFamilies: 0,
          partialFamilies: 0
        });
      }
      setLoading(false);
    }, (error) => {
      console.error('Error loading families data:', error);
      setLoading(false);
    });

    return () => {
      off(familiesRef, 'value', unsubscribe);
    };
  }, [user, claimsLoading]);

  // Filter families based on search term
  const filteredFamilies = useMemo(() => {
    if (!searchTerm.trim()) return families;

    const searchLower = searchTerm.toLowerCase();
    return Object.fromEntries(
      Object.entries(families).filter(([familyId, family]) => {
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

        // Search in family ID
        if (familyId.toLowerCase().includes(searchLower)) return true;

        return false;
      })
    );
  }, [families, searchTerm]);

  const handleViewDetails = (familyId, family) => {
    setSelectedFamilyId(familyId);
    setSelectedFamily(family);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setSelectedFamily(null);
    setSelectedFamilyId(null);
    setShowDetailsModal(false);
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
            <Home className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Home Education Staff Dashboard</h1>
            <p className="text-gray-600">Overview and management of home education families</p>
          </div>
        </div>

        {/* Current school year info */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-blue-900">
              Current School Year: {getCurrentSchoolYear()}
            </span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Families"
          value={stats.totalFamilies}
          icon={Users}
          color="purple"
        />
        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          icon={GraduationCap}
          color="blue"
        />
        <StatsCard
          title="Registered Families"
          value={stats.registeredFamilies}
          icon={CheckCircle2}
          color="green"
          subtitle={`${stats.totalFamilies > 0 ? Math.round((stats.registeredFamilies / stats.totalFamilies) * 100) : 0}% complete`}
        />
        <StatsCard
          title="Pending Registration"
          value={stats.pendingFamilies + stats.partialFamilies}
          icon={AlertCircle}
          color="orange"
          subtitle={`${stats.partialFamilies} partial, ${stats.pendingFamilies} not started`}
        />
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search families, students, guardians, or ASNs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {Object.keys(filteredFamilies).length} of {stats.totalFamilies} families
        </p>
      </div>

      {/* Families Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Object.entries(filteredFamilies).map(([familyId, family]) => (
          <FamilyCard
            key={familyId}
            family={family}
            familyId={familyId}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

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
    </div>
  );
};

export default HomeEducationStaffDashboard;