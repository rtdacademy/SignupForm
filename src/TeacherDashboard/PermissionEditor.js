import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { User, Shield, AlertCircle, CheckCircle, RefreshCw, Plus, Trash2, Info, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';

const PermissionEditor = ({ user, isOpen, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quickRole, setQuickRole] = useState('');
  const [individualPermissions, setIndividualPermissions] = useState({
    staff: false,
    teacher: false,
    course_manager: false,
    admin: false,
    super_admin: false
  });
  const [customClaims, setCustomClaims] = useState([]);
  const [reason, setReason] = useState('');
  const [useQuickRole, setUseQuickRole] = useState(true);

  // Permission hierarchy for reference
  const PERMISSION_HIERARCHY = {
    'super_admin': ['super_admin', 'admin', 'course_manager', 'teacher', 'staff'],
    'admin': ['admin', 'course_manager', 'teacher', 'staff'],
    'course_manager': ['course_manager', 'teacher', 'staff'],
    'teacher': ['teacher', 'staff'],
    'staff': ['staff']
  };

  const ROLE_OPTIONS = [
    { 
      value: '', 
      label: 'No Staff Role',
      description: 'Remove all staff permissions',
      permissions: []
    },
    { 
      value: 'staff', 
      label: 'Staff',
      description: 'Basic staff member with platform access',
      permissions: ['staff']
    },
    { 
      value: 'teacher', 
      label: 'Teacher',
      description: 'Can manage courses and view student data',
      permissions: ['staff', 'teacher']
    },
    { 
      value: 'course_manager', 
      label: 'Course Manager',
      description: 'Can create/edit courses and manage teachers',
      permissions: ['staff', 'teacher', 'course_manager']
    },
    { 
      value: 'admin', 
      label: 'Admin',
      description: 'Can manage staff permissions and system settings',
      permissions: ['staff', 'teacher', 'course_manager', 'admin']
    },
    { 
      value: 'super_admin', 
      label: 'Super Admin',
      description: 'Full system access and can manage other admins',
      permissions: ['staff', 'teacher', 'course_manager', 'admin', 'super_admin']
    }
  ];

  // Initialize form with current user permissions
  useEffect(() => {
    if (user && isOpen) {
      const currentRole = user.currentClaims?.staffRole || '';
      setQuickRole(currentRole);
      
      // Set individual permissions based on current claims
      const currentPerms = user.currentClaims?.staffPermissions || [];
      setIndividualPermissions({
        staff: currentPerms.includes('staff'),
        teacher: currentPerms.includes('teacher'),
        course_manager: currentPerms.includes('course_manager'),
        admin: currentPerms.includes('admin'),
        super_admin: currentPerms.includes('super_admin')
      });

      // Extract custom claims (non-staff related)
      const allClaims = user.allCustomClaims || {};
      const staffClaimKeys = [
        'staffPermissions', 'staffRole', 'lastPermissionUpdate', 'permissionSource',
        'isStaffUser', 'isAdminUser', 'isSuperAdminUser', 'lastUpdatedBy'
      ];
      
      const customClaimsArray = Object.entries(allClaims)
        .filter(([key]) => !staffClaimKeys.includes(key))
        .map(([key, value]) => ({ 
          id: Math.random().toString(36).substr(2, 9),
          key, 
          value: typeof value === 'string' ? value : JSON.stringify(value) 
        }));
      
      setCustomClaims(customClaimsArray);
      setReason('');
      setError('');
      setUseQuickRole(true);
    }
  }, [user, isOpen]);

  // Update individual permissions when quick role changes
  useEffect(() => {
    if (useQuickRole && quickRole && PERMISSION_HIERARCHY[quickRole]) {
      const rolePermissions = PERMISSION_HIERARCHY[quickRole];
      setIndividualPermissions({
        staff: rolePermissions.includes('staff'),
        teacher: rolePermissions.includes('teacher'),
        course_manager: rolePermissions.includes('course_manager'),
        admin: rolePermissions.includes('admin'),
        super_admin: rolePermissions.includes('super_admin')
      });
    }
  }, [quickRole, useQuickRole]);

  const handleIndividualPermissionChange = (permission, checked) => {
    setIndividualPermissions(prev => ({
      ...prev,
      [permission]: checked
    }));
    setUseQuickRole(false); // Switch to individual mode when manually changed
  };

  const addCustomClaim = () => {
    setCustomClaims(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      key: '',
      value: ''
    }]);
  };

  const removeCustomClaim = (id) => {
    setCustomClaims(prev => prev.filter(claim => claim.id !== id));
  };

  const updateCustomClaim = (id, field, value) => {
    setCustomClaims(prev => prev.map(claim => 
      claim.id === id ? { ...claim, [field]: value } : claim
    ));
  };


  const handleSave = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for this permission change');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const functions = getFunctions();
      const updateStaffPermissions = httpsCallable(functions, 'updateStaffPermissions');
      
      const customClaimsObject = customClaims.reduce((acc, claim) => {
        if (claim.key.trim()) {
          // Try to parse as JSON, fallback to string
          try {
            acc[claim.key] = JSON.parse(claim.value);
          } catch {
            acc[claim.key] = claim.value;
          }
        }
        return acc;
      }, {});

      const updateData = {
        targetUid: user.uid,
        reason: reason.trim(),
        customClaims: customClaimsObject
      };

      if (useQuickRole) {
        updateData.staffRole = quickRole || null;
      } else {
        updateData.individualPermissions = Object.entries(individualPermissions)
          .filter(([_, checked]) => checked)
          .map(([perm, _]) => perm);
      }

      const result = await updateStaffPermissions(updateData);
      
      if (result.data.success) {
        onSave(result.data);
        onClose();
      } else {
        setError('Failed to update permissions');
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      if (error.code === 'functions/permission-denied') {
        setError('You do not have permission to update staff permissions');
      } else if (error.code === 'functions/not-found') {
        setError('User not found');
      } else {
        setError('An error occurred while updating permissions');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAllPermissions = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for removing permissions');
      return;
    }

    if (!window.confirm('Are you sure you want to remove ALL staff permissions from this user?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const functions = getFunctions();
      const removeStaffPermissions = httpsCallable(functions, 'removeStaffPermissions');
      
      const result = await removeStaffPermissions({
        targetUid: user.uid,
        reason: reason.trim()
      });
      
      if (result.data.success) {
        onSave({ success: true, removed: true });
        onClose();
      } else {
        setError('Failed to remove permissions');
      }
    } catch (error) {
      console.error('Error removing permissions:', error);
      setError('An error occurred while removing permissions');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Edit Permissions</span>
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">

          {/* User Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium">{user.email}</div>
                <div className="text-sm text-gray-500 font-mono">{user.uid}</div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-800 font-medium">Error</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Current Permissions Display */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <Info className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-blue-900">Current Permissions</h4>
              </div>
              <div className="text-sm text-blue-800">
                <div><strong>Role:</strong> {user.currentClaims?.staffRole || 'None'}</div>
                <div><strong>Permissions:</strong> {user.currentClaims?.staffPermissions?.length > 0 ? user.currentClaims.staffPermissions.join(', ') : 'None'}</div>
              </div>
            </div>

            {/* Permission Assignment Method */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">How do you want to set permissions?</h3>
              <div className="space-y-4">
                <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  useQuickRole ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => setUseQuickRole(true)}>
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="radio"
                      checked={useQuickRole}
                      onChange={() => setUseQuickRole(true)}
                      className="mr-3 mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Role-Based Assignment</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Choose a role and automatically get all permissions for that level and below.
                        <br />Example: "Teacher" role includes both "teacher" and "staff" permissions.
                      </div>
                    </div>
                  </label>
                </div>
                <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  !useQuickRole ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => setUseQuickRole(false)}>
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="radio"
                      checked={!useQuickRole}
                      onChange={() => setUseQuickRole(false)}
                      className="mr-3 mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Custom Permission Selection</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Manually choose exactly which permissions to grant.
                        <br />Use this for special cases where you need specific combinations.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Role-Based Assignment */}
            {useQuickRole && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Select a Role</h3>
                <div className="space-y-3">
                  {ROLE_OPTIONS.map(option => (
                    <div 
                      key={option.value} 
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        quickRole === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setQuickRole(option.value)}
                    >
                      <label className="flex items-start cursor-pointer">
                        <input
                          type="radio"
                          name="roleSelect"
                          value={option.value}
                          checked={quickRole === option.value}
                          onChange={(e) => setQuickRole(e.target.value)}
                          className="mr-3 mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-gray-900">{option.label}</div>
                            {option.permissions.length > 0 && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span>Includes:</span>
                                <div className="flex space-x-1">
                                  {option.permissions.map((perm, idx) => (
                                    <span key={perm} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      {perm.replace('_', ' ')}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Individual Permissions */}
            {!useQuickRole && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Select Individual Permissions</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800 font-medium">Advanced Mode</span>
                  </div>
                  <p className="text-xs text-yellow-700 mt-1">
                    Only use this if you need a specific combination of permissions that doesn't match a standard role.
                  </p>
                </div>
                <div className="space-y-3">
                  {Object.entries(individualPermissions).map(([permission, checked]) => {
                    const permissionDescriptions = {
                      'staff': 'Basic staff member access to the platform',
                      'teacher': 'Can manage courses and view student data',
                      'course_manager': 'Can create/edit courses and manage teachers',
                      'admin': 'Can manage staff permissions and system settings',
                      'super_admin': 'Full system access and can manage other admins'
                    };
                    
                    return (
                      <div key={permission} className={`border rounded-lg p-3 ${checked ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                        <label className="flex items-start cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => handleIndividualPermissionChange(permission, e.target.checked)}
                            className="mr-3 mt-1"
                          />
                          <div>
                            <div className="font-medium text-gray-900 capitalize">{permission.replace('_', ' ')}</div>
                            <div className="text-sm text-gray-600 mt-1">{permissionDescriptions[permission]}</div>
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Permission Preview */}
            {((useQuickRole && quickRole) || (!useQuickRole && Object.values(individualPermissions).some(p => p))) && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <ArrowRight className="h-4 w-4 text-gray-600" />
                  <h4 className="font-medium text-gray-900">Permission Changes Preview</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-700 mb-2">Current</div>
                    <div className="space-y-1">
                      <div><strong>Role:</strong> {user.currentClaims?.staffRole || 'None'}</div>
                      <div><strong>Permissions:</strong></div>
                      <div className="flex flex-wrap gap-1">
                        {(user.currentClaims?.staffPermissions || []).map(perm => (
                          <span key={perm} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {perm.replace('_', ' ')}
                          </span>
                        ))}
                        {(!user.currentClaims?.staffPermissions || user.currentClaims?.staffPermissions.length === 0) && (
                          <span className="text-gray-500">None</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700 mb-2">Will Become</div>
                    <div className="space-y-1">
                      <div><strong>Role:</strong> {useQuickRole ? (quickRole || 'None') : (Object.entries(individualPermissions).filter(([_, checked]) => checked).map(([perm]) => perm).sort().reverse()[0] || 'None')}</div>
                      <div><strong>Permissions:</strong></div>
                      <div className="flex flex-wrap gap-1">
                        {useQuickRole && quickRole && PERMISSION_HIERARCHY[quickRole] ? 
                          PERMISSION_HIERARCHY[quickRole].map(perm => (
                            <span key={perm} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {perm.replace('_', ' ')}
                            </span>
                          )) :
                          !useQuickRole ? 
                            Object.entries(individualPermissions)
                              .filter(([_, checked]) => checked)
                              .map(([perm]) => (
                                <span key={perm} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {perm.replace('_', ' ')}
                                </span>
                              )) :
                            <span className="text-gray-500">None</span>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Claims */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Custom Claims</h3>
                <Button
                  type="button"
                  onClick={addCustomClaim}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Claim</span>
                </Button>
              </div>
              
              <div className="space-y-3">
                {customClaims.map(claim => (
                  <div key={claim.id} className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Key"
                      value={claim.key}
                      onChange={(e) => updateCustomClaim(claim.id, 'key', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={claim.value}
                      onChange={(e) => updateCustomClaim(claim.id, 'value', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button
                      type="button"
                      onClick={() => removeCustomClaim(claim.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {customClaims.length === 0 && (
                  <p className="text-gray-500 text-sm">No custom claims defined</p>
                )}
              </div>
            </div>


            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Change *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Explain why you're making this permission change..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Button
                onClick={handleRemoveAllPermissions}
                disabled={loading}
                variant="outline"
                className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
              >
                Remove All Staff Permissions
              </Button>
              
              <div className="flex space-x-3">
                <Button
                  onClick={onClose}
                  disabled={loading}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading || !reason.trim()}
                  className="flex items-center space-x-2"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <span>Save Changes</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PermissionEditor;