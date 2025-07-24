import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { User, Shield, AlertCircle, CheckCircle, RefreshCw, Plus, Trash2 } from 'lucide-react';
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
    { value: '', label: 'No Staff Role' },
    { value: 'staff', label: 'Staff' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'course_manager', label: 'Course Manager' },
    { value: 'admin', label: 'Admin' },
    { value: 'super_admin', label: 'Super Admin' }
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
            {/* Permission Assignment Method */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Permission Assignment Method</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={useQuickRole}
                    onChange={() => setUseQuickRole(true)}
                    className="mr-2"
                  />
                  <span>Quick Role Assignment (with hierarchy)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!useQuickRole}
                    onChange={() => setUseQuickRole(false)}
                    className="mr-2"
                  />
                  <span>Individual Permissions (fine-tune control)</span>
                </label>
              </div>
            </div>

            {/* Quick Role Selection */}
            {useQuickRole && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Role Assignment</h3>
                <select
                  value={quickRole}
                  onChange={(e) => setQuickRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ROLE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {quickRole && PERMISSION_HIERARCHY[quickRole] && (
                  <p className="text-sm text-gray-600 mt-2">
                    This will grant: {PERMISSION_HIERARCHY[quickRole].join(', ')}
                  </p>
                )}
              </div>
            )}

            {/* Individual Permissions */}
            {!useQuickRole && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Individual Permissions</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(individualPermissions).map(([permission, checked]) => (
                    <label key={permission} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => handleIndividualPermissionChange(permission, e.target.checked)}
                        className="mr-2"
                      />
                      <span className="capitalize">{permission.replace('_', ' ')}</span>
                    </label>
                  ))}
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