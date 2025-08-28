import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Search, Shield, AlertCircle, RefreshCw, User, Mail, Users, Clock, Eye, Edit, Code, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';
import PermissionEditor from './PermissionEditor';

const StaffPermissionsManager = () => {
  const { user, isSuperAdminUser } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [allStaffData, setAllStaffData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAll, setLoadingAll] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [isPermissionEditorOpen, setIsPermissionEditorOpen] = useState(false);
  const [rawClaimsUser, setRawClaimsUser] = useState(null);
  const [isRawClaimsOpen, setIsRawClaimsOpen] = useState(false);

  // Fetch all staff data on component mount
  useEffect(() => {
    if (user && (isSuperAdminUser || user.email === 'kyle@rtdacademy.com')) {
      fetchAllStaffPermissions();
    }
  }, [user, isSuperAdminUser]);

  const fetchAllStaffPermissions = async () => {
    setLoadingAll(true);
    setError('');

    try {
      const functions = getFunctions();
      const getAllStaffPermissionsOptimized = httpsCallable(functions, 'getAllStaffPermissionsOptimized');
      
      const result = await getAllStaffPermissionsOptimized();
      
      if (result.data.success) {
        setAllStaffData(result.data);
      } else {
        setError('Failed to fetch staff permissions');
      }
    } catch (error) {
      console.error('Error fetching all staff permissions:', error);
      if (error.code === 'functions/permission-denied') {
        setError('You do not have permission to perform this action');
      } else {
        setError('An error occurred while fetching staff permissions');
      }
    } finally {
      setLoadingAll(false);
    }
  };

  // Check if user has super admin access
  if (!user || (!isSuperAdminUser && user.email !== 'kyle@rtdacademy.com')) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <h3 className="text-red-800 font-medium">Access Denied</h3>
          </div>
          <p className="text-red-700 mt-1">
            This feature is only available to Super Admin users.
          </p>
        </div>
      </div>
    );
  }

  const handleSearch = async () => {
    if (!searchInput.trim()) {
      setError('Please enter an email address or user ID');
      return;
    }

    setLoading(true);
    setError('');
    setSearchResults(null);

    try {
      const functions = getFunctions();
      const getAnyUserPermissions = httpsCallable(functions, 'getAnyUserPermissions');
      
      // Determine if input is email or UID
      const isEmail = searchInput.includes('@');
      const searchData = isEmail 
        ? { targetEmail: searchInput.trim() }
        : { targetUid: searchInput.trim() };

      const result = await getAnyUserPermissions(searchData);
      
      if (result.data.success) {
        setSearchResults(result.data);
      } else {
        setError('Failed to fetch user permissions');
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      if (error.code === 'functions/not-found') {
        setError('User not found');
      } else if (error.code === 'functions/permission-denied') {
        setError('You do not have permission to perform this action');
      } else {
        setError('An error occurred while fetching permissions');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };


  const handleEditPermissions = (staff) => {
    setEditingUser(staff);
    setIsPermissionEditorOpen(true);
  };

  const handlePermissionSave = (result) => {
    console.log('Permissions updated:', result);
    // Refresh the staff data to show changes
    fetchAllStaffPermissions();
    
    // Show success message
    setError(''); // Clear any existing errors
    // You could add a success toast here if you have a toast system
  };

  const handleClosePermissionEditor = () => {
    setIsPermissionEditorOpen(false);
    setEditingUser(null);
  };

  const handleViewRawClaims = async (staff) => {
    setLoading(true);
    try {
      const functions = getFunctions();
      const getAnyUserPermissions = httpsCallable(functions, 'getAnyUserPermissions');
      
      const result = await getAnyUserPermissions({
        targetUid: staff.uid
      });
      
      if (result.data.success) {
        setRawClaimsUser({
          ...staff,
          allCustomClaims: result.data.allCustomClaims || {}
        });
        setIsRawClaimsOpen(true);
      }
    } catch (error) {
      console.error('Error fetching raw claims:', error);
      setError('Failed to fetch raw claims');
    } finally {
      setLoading(false);
    }
  };


  const StaffSummaryCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );


  const getRoleBadge = (staffRole) => {
    const roleColors = {
      'super_admin': 'bg-purple-100 text-purple-800',
      'admin': 'bg-blue-100 text-blue-800',
      'course_manager': 'bg-green-100 text-green-800',
      'teacher': 'bg-yellow-100 text-yellow-800',
      'staff': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[staffRole] || 'bg-gray-100 text-gray-800'}`}>
        {staffRole || 'None'}
      </span>
    );
  };

  // Show loading state while fetching all staff
  if (loadingAll) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading all staff permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Staff Permissions Manager</h1>
          </div>
          <Button
            onClick={fetchAllStaffPermissions}
            disabled={loadingAll}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${loadingAll ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
        <p className="text-gray-600">
          Overview of all staff members and their custom claims permissions.
        </p>
      </div>

 

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 font-medium">Error</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      {allStaffData && allStaffData.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StaffSummaryCard
            title="Total Staff"
            value={allStaffData.summary.totalStaff}
            icon={Users}
            color="bg-blue-500"
          />
          <StaffSummaryCard
            title="Super Admins"
            value={allStaffData.summary.superAdmins}
            icon={Shield}
            color="bg-purple-500"
          />
          <StaffSummaryCard
            title="Admins"
            value={allStaffData.summary.admins}
            icon={Shield}
            color="bg-blue-600"
          />
          <StaffSummaryCard
            title="Auth Missing"
            value={allStaffData.summary.authMissing}
            icon={AlertCircle}
            color="bg-red-500"
          />
        </div>
      )}

      {/* All Staff Table */}
      {allStaffData && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Staff Members</h2>
            <p className="text-sm text-gray-600">
              Last updated: {new Date(allStaffData.timestamp).toLocaleString()} • 
              Source: {allStaffData.source === 'database_index' ? 'Database Index (Optimized)' : 'Firebase Auth (Legacy)'}
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Special
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Sign In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allStaffData.staffPermissions.map((staff, index) => (
                  <tr key={staff.uid || staff.email} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{staff.email}</div>
                          <div className="text-xs text-gray-500">
                            {staff.displayName && <div>{staff.displayName}</div>}
                            {staff.uid ? (
                              <div className="font-mono">{staff.uid}</div>
                            ) : (
                              <div className="text-red-500">No Auth Account</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {staff.currentClaims?.staffRole ? getRoleBadge(staff.currentClaims.staffRole) : (
                        <span className="text-xs text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {staff.currentClaims?.isRTDLearningAdmin && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          RTD Learning
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {staff.lastSignInTime 
                            ? new Date(staff.lastSignInTime).toLocaleDateString()
                            : staff.lastLogin 
                            ? new Date(staff.lastLogin).toLocaleDateString()
                            : 'Never'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedUser(staff)}
                          className="flex items-center space-x-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View</span>
                        </Button>
                        {staff.uid && (
                          <Button
                            size="sm"
                            onClick={() => handleEditPermissions(staff)}
                            className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Edit className="h-3 w-3" />
                            <span>Edit</span>
                          </Button>
                        )}
                        {staff.uid && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewRawClaims(staff)}
                            className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
                          >
                            <Code className="h-3 w-3" />
                            <span>Raw</span>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Search Section */}
      <div className="bg-white border border-gray-200 rounded-lg mt-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Search Any User</h2>
          <p className="text-sm text-gray-600">Search for any user on the platform by email or user ID</p>
        </div>
        <div className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter any user's email address or user ID..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading || !searchInput.trim()}
              className="flex items-center space-x-2"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span>Search</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Selected User Details Sheet */}
      <Sheet open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Staff Details</span>
            </SheetTitle>
          </SheetHeader>
          
          {selectedUser && (
            <div className="mt-6">
              {/* User Info */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">Email:</span>
                    <span className="font-medium">{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">UID:</span>
                    <span className="font-mono text-sm">{selectedUser.uid}</span>
                  </div>
                </div>
              </div>

              {selectedUser.error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-red-800 font-medium">Error</span>
                  </div>
                  <p className="text-red-700 mt-1">{selectedUser.error}</p>
                </div>
              ) : (
                <>
                  {/* Current Permissions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Current Permissions</h3>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-3">
                        <div>
                          <span className="text-gray-600">Staff Permissions:</span>
                          <div className="font-medium mt-1">
                            {selectedUser.currentClaims.staffPermissions?.length > 0 
                              ? selectedUser.currentClaims.staffPermissions.join(', ')
                              : 'None'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Staff Role:</span>
                          <div className="font-medium mt-1">
                            {selectedUser.currentClaims.staffRole || 'None'}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                          <div>
                            <span className="text-gray-600 text-sm">Is Staff:</span>
                            <div className="font-medium">
                              {selectedUser.currentClaims.isStaffUser ? 'Yes' : 'No'}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600 text-sm">Is Teacher:</span>
                            <div className="font-medium">
                              {selectedUser.currentClaims.isTeacher ? 'Yes' : 'No'}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600 text-sm">Is Course Manager:</span>
                            <div className="font-medium">
                              {selectedUser.currentClaims.isCourseManager ? 'Yes' : 'No'}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600 text-sm">Is Admin:</span>
                            <div className="font-medium">
                              {selectedUser.currentClaims.isAdminUser ? 'Yes' : 'No'}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600 text-sm">Is Super Admin:</span>
                            <div className="font-medium">
                              {selectedUser.currentClaims.isSuperAdminUser ? 'Yes' : 'No'}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600 text-sm">RTD Learning:</span>
                            <div className="font-medium">
                              {selectedUser.currentClaims.isRTDLearningAdmin ? 'Yes' : 'No'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Metadata */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Metadata</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Last Permission Update:</span>
                        <div className="font-medium">
                          {selectedUser.currentClaims.lastPermissionUpdate 
                            ? new Date(selectedUser.currentClaims.lastPermissionUpdate).toLocaleString()
                            : 'Never'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Permission Source:</span>
                        <div className="font-medium">
                          {selectedUser.currentClaims.permissionSource || 'Unknown'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Account Created:</span>
                        <div className="font-medium">
                          {selectedUser.creationTime 
                            ? new Date(selectedUser.creationTime).toLocaleString()
                            : 'Unknown'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Email Verified:</span>
                        <div className="font-medium">
                          {selectedUser.emailVerified ? 'Yes' : 'No'}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Individual Search Results */}
      {searchResults && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Search Results</h2>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              searchResults.userType === 'staff' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {searchResults.userType === 'staff' ? 'Staff Member' : 'Regular User'}
            </span>
          </div>

          {/* User Basic Info */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Email:</span>
                <div className="font-medium">{searchResults.email}</div>
              </div>
              <div>
                <span className="text-gray-600">UID:</span>
                <div className="font-mono text-xs">{searchResults.uid}</div>
              </div>
              <div>
                <span className="text-gray-600">Email Verified:</span>
                <div className="font-medium">{searchResults.emailVerified ? 'Yes' : 'No'}</div>
              </div>
              <div>
                <span className="text-gray-600">Account Status:</span>
                <div className="font-medium">{searchResults.disabled ? 'Disabled' : 'Active'}</div>
              </div>
              <div>
                <span className="text-gray-600">Last Sign In:</span>
                <div className="font-medium">
                  {searchResults.lastSignInTime 
                    ? new Date(searchResults.lastSignInTime).toLocaleDateString()
                    : 'Never'}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Account Created:</span>
                <div className="font-medium">
                  {searchResults.creationTime 
                    ? new Date(searchResults.creationTime).toLocaleDateString()
                    : 'Unknown'}
                </div>
              </div>
            </div>
          </div>

          {searchResults.isStaff ? (
            // Staff user - show current staff permissions
            <>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Current Staff Permissions</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div>
                    <span className="text-gray-600">Staff Permissions:</span>
                    <div className="font-medium mt-1">
                      {searchResults.currentClaims.staffPermissions?.length > 0 
                        ? searchResults.currentClaims.staffPermissions.join(', ')
                        : 'None'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Staff Role:</span>
                    <div className="font-medium mt-1">
                      {searchResults.currentClaims.staffRole || 'None'}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                    <div>
                      <span className="text-gray-600 text-sm">Is Staff:</span>
                      <div className="font-medium">
                        {searchResults.currentClaims.isStaffUser ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Is Teacher:</span>
                      <div className="font-medium">
                        {searchResults.currentClaims.isTeacher ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Is Course Manager:</span>
                      <div className="font-medium">
                        {searchResults.currentClaims.isCourseManager ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Is Admin:</span>
                      <div className="font-medium">
                        {searchResults.currentClaims.isAdminUser ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Is Super Admin:</span>
                      <div className="font-medium">
                        {searchResults.currentClaims.isSuperAdminUser ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">RTD Learning Admin:</span>
                      <div className="font-medium">
                        {searchResults.currentClaims.isRTDLearningAdmin ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Regular user - show family/parent permissions
            <>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Permissions & Claims</h3>
                <p className="text-gray-600 mb-4">
                  This is a regular user (not staff). Below are their current custom claims:
                </p>
              </div>

              <div className="space-y-4">
                {/* Family/Parent Claims */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-3">Family & Parent Claims</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Family ID:</span>
                      <div className="font-medium">
                        {searchResults.currentClaims.familyId || 'None'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Family Role:</span>
                      <div className="font-medium">
                        {searchResults.currentClaims.familyRole || 'None'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Is Parent:</span>
                      <div className="font-medium">
                        {searchResults.currentClaims.isParent ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Is Home Education Parent:</span>
                      <div className="font-medium">
                        {searchResults.currentClaims.isHomeEducationParent ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Family Update:</span>
                      <div className="font-medium">
                        {searchResults.currentClaims.lastFamilyUpdate 
                          ? new Date(searchResults.currentClaims.lastFamilyUpdate).toLocaleString()
                          : 'None'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* All Custom Claims Debug */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-3">All Custom Claims (Debug)</h4>
                  <div className="bg-white p-3 rounded border">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(searchResults.allCustomClaims, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Permission Editor Modal */}
      <PermissionEditor
        user={editingUser}
        isOpen={isPermissionEditorOpen}
        onClose={handleClosePermissionEditor}
        onSave={handlePermissionSave}
      />

      {/* Raw Claims Sheet */}
      <Sheet open={isRawClaimsOpen} onOpenChange={setIsRawClaimsOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center space-x-2">
              <Code className="h-5 w-5" />
              <span>Raw Custom Claims</span>
            </SheetTitle>
          </SheetHeader>
          
          {rawClaimsUser && (
            <div className="mt-6">

              {/* User Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="font-medium">{rawClaimsUser.email}</div>
                    <div className="text-sm text-gray-500 font-mono">{rawClaimsUser.uid}</div>
                  </div>
                </div>
              </div>

              {/* Raw Claims Display */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">All Custom Claims (Raw JSON)</h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(rawClaimsUser.allCustomClaims, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Claims Analysis */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Claims Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Staff Claims</h4>
                    <div className="text-sm space-y-1">
                      <div><span className="text-blue-600">Permissions:</span> {JSON.stringify(rawClaimsUser.allCustomClaims.staffPermissions || [])}</div>
                      <div><span className="text-blue-600">Role:</span> {rawClaimsUser.allCustomClaims.staffRole || 'None'}</div>
                      <div><span className="text-blue-600">Is Staff:</span> {String(rawClaimsUser.allCustomClaims.isStaffUser || false)}</div>
                      <div><span className="text-blue-600">Is Admin:</span> {String(rawClaimsUser.allCustomClaims.isAdminUser || false)}</div>
                      <div><span className="text-blue-600">Is Super Admin:</span> {String(rawClaimsUser.allCustomClaims.isSuperAdminUser || false)}</div>
                      <div><span className="text-blue-600">RTD Learning Admin:</span> {String(rawClaimsUser.allCustomClaims.isRTDLearningAdmin || false)}</div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Family Claims</h4>
                    <div className="text-sm space-y-1">
                      <div><span className="text-green-600">Family ID:</span> {rawClaimsUser.allCustomClaims.familyId || 'None'}</div>
                      <div><span className="text-green-600">Family Role:</span> {rawClaimsUser.allCustomClaims.familyRole || 'None'}</div>
                      <div><span className="text-green-600">Is Parent:</span> {String(rawClaimsUser.allCustomClaims.isParent || false)}</div>
                      <div><span className="text-green-600">Is Home Ed Parent:</span> {String(rawClaimsUser.allCustomClaims.isHomeEducationParent || false)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Claims */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Custom/Other Claims</h3>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  {Object.entries(rawClaimsUser.allCustomClaims)
                    .filter(([key]) => ![
                      'staffPermissions', 'staffRole', 'isStaffUser', 'isAdminUser', 'isSuperAdminUser',
                      'familyId', 'familyRole', 'isParent', 'isHomeEducationParent',
                      'lastPermissionUpdate', 'permissionSource', 'lastUpdatedBy', 'lastFamilyUpdate'
                    ].includes(key))
                    .map(([key, value]) => (
                      <div key={key} className="text-sm mb-1">
                        <span className="text-yellow-700 font-medium">{key}:</span>{' '}
                        <span className="text-yellow-800">{JSON.stringify(value)}</span>
                      </div>
                    ))}
                  {Object.keys(rawClaimsUser.allCustomClaims).filter(key => ![
                    'staffPermissions', 'staffRole', 'isStaffUser', 'isAdminUser', 'isSuperAdminUser',
                    'familyId', 'familyRole', 'isParent', 'isHomeEducationParent',
                    'lastPermissionUpdate', 'permissionSource', 'lastUpdatedBy', 'lastFamilyUpdate'
                  ].includes(key)).length === 0 && (
                    <div className="text-sm text-yellow-600">No custom claims found</div>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Metadata</h3>
                <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-1">
                  <div><span className="text-gray-600">Last Permission Update:</span> {rawClaimsUser.allCustomClaims.lastPermissionUpdate ? new Date(rawClaimsUser.allCustomClaims.lastPermissionUpdate).toLocaleString() : 'Never'}</div>
                  <div><span className="text-gray-600">Permission Source:</span> {rawClaimsUser.allCustomClaims.permissionSource || 'Unknown'}</div>
                  <div><span className="text-gray-600">Last Updated By:</span> {rawClaimsUser.allCustomClaims.lastUpdatedBy || 'Unknown'}</div>
                  <div><span className="text-gray-600">Total Claims Count:</span> {Object.keys(rawClaimsUser.allCustomClaims).length}</div>
                </div>
              </div>

            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default StaffPermissionsManager;