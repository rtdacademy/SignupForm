import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getDatabase, ref, get, set, update, remove, push, query, orderByChild, equalTo } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../context/AuthContext';
import { useSchoolYear } from '../context/SchoolYearContext';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '../components/ui/dialog';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Users,
  UserPlus,
  UserMinus,
  Shield,
  ShieldCheck,
  ShieldX,
  Search,
  Mail,
  Phone,
  Calendar,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Link as LinkIcon,
  Unlink,
  Settings,
  Filter,
  RefreshCw,
  UserX,
  UserCheck,
  Info,
  Send
} from 'lucide-react';
import { toast } from 'sonner';

const ParentStudentManagement = () => {
  const { user } = useAuth();
  const { studentSummaries } = useSchoolYear();
  const [loading, setLoading] = useState(false);
  
  // Parent search state
  const [parentSearchEmail, setParentSearchEmail] = useState('');
  const [parentSearchResults, setParentSearchResults] = useState(null);
  const [searchingParent, setSearchingParent] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  
  // Student search state
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchingStudent, setSearchingStudent] = useState(false);
  
  // Link state
  const [canLink, setCanLink] = useState(false);
  const [linkRelationship, setLinkRelationship] = useState('Parent');
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(false);
  const [directLink, setDirectLink] = useState(false); // true = direct link, false = require verification
  
  // Dialog states
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [showRestrictDialog, setShowRestrictDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Permission/restriction management
  const [managingStudentKey, setManagingStudentKey] = useState(null);
  const [managingParentKey, setManagingParentKey] = useState(null);
  const [editingPermissions, setEditingPermissions] = useState({});
  const [restrictionReason, setRestrictionReason] = useState('');

  const db = getDatabase();

  // Check if we can link (both parent and student selected)
  useEffect(() => {
    setCanLink(selectedParent && selectedStudent);
  }, [selectedParent, selectedStudent]);

  // Search for parent by email
  const searchParentByEmail = async () => {
    if (!parentSearchEmail.trim()) {
      toast.error('Please enter a parent email');
      return;
    }

    setSearchingParent(true);
    try {
      const parentEmailKey = sanitizeEmail(parentSearchEmail.trim());
      const parentRef = ref(db, `parents/${parentEmailKey}`);
      const parentSnapshot = await get(parentRef);

      if (parentSnapshot.exists()) {
        const parentData = parentSnapshot.val();
        setParentSearchResults({
          exists: true,
          parentKey: parentEmailKey,
          profile: parentData.profile || {},
          linkedStudents: parentData.linkedStudents || {}
        });
      } else {
        setParentSearchResults({
          exists: false,
          parentEmail: parentSearchEmail.trim(),
          parentKey: parentEmailKey
        });
      }
    } catch (error) {
      console.error('Error searching parent:', error);
      toast.error('Failed to search parent account');
    } finally {
      setSearchingParent(false);
    }
  };

  // Select parent for linking
  const handleSelectParent = (parentInfo) => {
    setSelectedParent(parentInfo);
  };

  // Select student for linking
  const handleSelectStudent = (student) => {
    setSelectedStudent({
      ...student,
      studentKey: sanitizeEmail(student.StudentEmail),
      fullName: `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.StudentEmail
    });
  };

  // Handle linking accounts (direct or via invitation)
  const handleLinkAccounts = async () => {
    if (!selectedParent || !selectedStudent) {
      toast.error('Please select both a parent and student');
      return;
    }

    const parentEmail = selectedParent.profile?.email || selectedParent.parentEmail;
    if (!parentEmail) {
      toast.error('Parent email not found');
      return;
    }

    setActionLoading(true);
    try {
      if (directLink) {
        // Direct linking - create links immediately without verification
        await createDirectLink(parentEmail);
      } else {
        // Create invitation for parent verification
        await createInvitation(parentEmail);
      }
      
      // Clear selections
      setSelectedParent(null);
      setSelectedStudent(null);
      setParentSearchEmail('');
      setStudentSearchTerm('');
      setParentSearchResults(null);
      
    } catch (error) {
      console.error('Error linking accounts:', error);
      toast.error('Failed to link accounts');
    } finally {
      setActionLoading(false);
    }
  };

  // Create direct link without verification
  const createDirectLink = async (parentEmail) => {
    const parentEmailKey = sanitizeEmail(parentEmail);
    const studentKey = selectedStudent.studentKey;

    // Check if parent account exists, create if not
    if (!selectedParent.exists) {
      await set(ref(db, `parents/${parentEmailKey}/profile`), {
        email: parentEmail,
        createdAt: new Date().toISOString(),
        emailVerified: false,
        accountCreationType: 'teacher_created'
      });
    }

    // Create the link from parent to student
    await set(ref(db, `parents/${parentEmailKey}/linkedStudents/${studentKey}`), {
      studentName: selectedStudent.fullName,
      relationship: linkRelationship,
      linkedAt: new Date().toISOString(),
      linkedBy: user.email,
      linkType: 'teacher_direct',
      isLegalGuardian: true,
      permissions: {
        viewGrades: true,
        viewSchedule: true,
        viewNotes: true,
        editContactInfo: true,
        approveEnrollment: true,
        viewPayments: false
      },
      enrollmentApproval: {
        status: 'not_required',
        courses: {}
      }
    });

    // Create bidirectional link from student to parent
    await set(ref(db, `students/${studentKey}/profile/parentAccounts/${parentEmailKey}`), {
      status: 'active',
      linkedAt: new Date().toISOString(),
      relationship: linkRelationship,
      linkedBy: user.email
    });

    toast.success(`Successfully linked ${selectedStudent.fullName} to ${parentEmail} directly.`);
  };

  // Create invitation for verification
  const createInvitation = async (parentEmail) => {
    // Get the first course for the student as required by invitation system
    const studentCourse = studentSummaries.find(s => s.StudentEmail === selectedStudent.StudentEmail);
    if (!studentCourse) {
      toast.error('No course found for this student');
      return;
    }

    const invitationRef = push(ref(db, 'parentInvitations'));
    
    await set(invitationRef, {
      parentEmail: parentEmail,
      parentName: selectedParent.profile?.displayName || 'Parent/Guardian',
      studentEmail: selectedStudent.StudentEmail,
      studentEmailKey: selectedStudent.studentKey,
      studentName: selectedStudent.fullName,
      relationship: linkRelationship,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      status: 'pending',
      courseId: studentCourse.CourseID,
      courseName: studentCourse.Course_Value,
      createdBy: user.email,
      creationType: 'teacher_manual',
      scenario: selectedParent.exists ? 'existing_parent_new_student' : 'new_parent',
      requiresToken: false, // Parent will see it in dashboard
      notificationOnly: !sendWelcomeEmail // Send email based on checkbox
    });

    const emailText = sendWelcomeEmail ? ' An email will be sent to the parent.' : ' The parent will see the request in their dashboard.';
    toast.success(`Invitation created!${emailText} Parent must verify student identity before link is active.`);
  };

  // Filter students from studentSummaries
  const filteredStudents = useMemo(() => {
    if (!studentSearchTerm.trim()) return [];
    
    const searchLower = studentSearchTerm.toLowerCase();
    
    // Get unique students (some may appear multiple times for different courses)
    const uniqueStudents = new Map();
    
    studentSummaries.forEach(student => {
      const email = student.StudentEmail;
      if (!uniqueStudents.has(email)) {
        const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim();
        if (
          fullName.toLowerCase().includes(searchLower) ||
          email.toLowerCase().includes(searchLower) ||
          (student.asn || '').includes(searchLower)
        ) {
          uniqueStudents.set(email, {
            ...student,
            studentKey: sanitizeEmail(email),
            fullName: fullName || email
          });
        }
      }
    });
    
    return Array.from(uniqueStudents.values());
  }, [studentSummaries, studentSearchTerm]);

  // Clear all selections
  const clearSelections = () => {
    setSelectedParent(null);
    setSelectedStudent(null);
    setParentSearchEmail('');
    setStudentSearchTerm('');
    setParentSearchResults(null);
  };

  // Handle unlinking parent from student  
  const handleUnlinkParent = async (studentKey, parentKey, studentName, parentEmail) => {
    if (!confirm(`Are you sure you want to unlink ${parentEmail} from ${studentName}?`)) {
      return;
    }

    setActionLoading(true);
    try {
      // Remove link from parent side
      await remove(ref(db, `parents/${parentKey}/linkedStudents/${studentKey}`));

      // Remove link from student side
      await remove(ref(db, `students/${studentKey}/profile/parentAccounts/${parentKey}`));

      toast.success(`Successfully unlinked ${parentEmail} from ${studentName}`);
      
      // Refresh parent data if viewing that parent
      if (parentSearchResults?.parentKey === parentKey) {
        await searchParentByEmail();
      }
    } catch (error) {
      console.error('Error unlinking parent:', error);
      toast.error('Failed to unlink parent account');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle permission updates
  const handleUpdatePermissions = async () => {
    if (!managingStudentKey || !managingParentKey) {
      toast.error('Missing required information');
      return;
    }

    setActionLoading(true);
    try {
      await update(ref(db, `parents/${managingParentKey}/linkedStudents/${managingStudentKey}/permissions`), editingPermissions);

      toast.success('Permissions updated successfully');
      setShowPermissionsDialog(false);
      setManagingParentKey(null);
      setManagingStudentKey(null);
      
      // Refresh parent data if viewing that parent
      if (parentSearchResults?.parentKey === managingParentKey) {
        await searchParentByEmail();
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error('Failed to update permissions');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle account restriction
  const handleRestrictAccount = async (restrict = true) => {
    if (!managingStudentKey || !managingParentKey) {
      toast.error('Missing required information');
      return;
    }

    setActionLoading(true);
    try {
      const updates = {
        isRestricted: restrict,
        restrictedAt: restrict ? new Date().toISOString() : null,
        restrictedBy: restrict ? user.email : null,
        restrictionReason: restrict ? restrictionReason : null
      };

      await update(ref(db, `parents/${managingParentKey}/linkedStudents/${managingStudentKey}`), updates);

      toast.success(`Account ${restrict ? 'restricted' : 'unrestricted'} successfully`);
      setShowRestrictDialog(false);
      setRestrictionReason('');
      setManagingParentKey(null);
      setManagingStudentKey(null);
      
      // Refresh parent data if viewing that parent
      if (parentSearchResults?.parentKey === managingParentKey) {
        await searchParentByEmail();
      }
    } catch (error) {
      console.error('Error updating restriction:', error);
      toast.error('Failed to update account restriction');
    } finally {
      setActionLoading(false);
    }
  };

  // Open permission dialog
  const openPermissionsDialog = (studentKey, parentKey, permissions) => {
    setManagingStudentKey(studentKey);
    setManagingParentKey(parentKey);
    setEditingPermissions(permissions || {
      viewGrades: true,
      viewSchedule: true,
      viewNotes: true,
      editContactInfo: true,
      approveEnrollment: true,
      viewPayments: false
    });
    setShowPermissionsDialog(true);
  };

  // Open restriction dialog
  const openRestrictDialog = (studentKey, parentKey, currentRestriction) => {
    setManagingStudentKey(studentKey);
    setManagingParentKey(parentKey);
    setRestrictionReason(currentRestriction?.restrictionReason || '');
    setShowRestrictDialog(true);
  };

  // Get linked students for a parent (for display)
  const getLinkedStudentsForParent = useCallback((linkedStudents) => {
    if (!linkedStudents) return [];
    
    return Object.entries(linkedStudents).map(([studentKey, linkData]) => {
      // Try to find student in summaries for additional info
      const studentSummary = studentSummaries.find(s => {
        const summaryStudentKey = sanitizeEmail(s.StudentEmail || '');
        return summaryStudentKey === studentKey;
      });
      
      return {
        studentKey,
        ...linkData,
        studentSummary,
        fullName: linkData.studentName || studentKey,
        email: studentSummary?.StudentEmail || ''
      };
    });
  }, [studentSummaries]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          Parent-Student Management
        </h1>
        <p className="text-gray-600">Link parent accounts to students and manage permissions</p>
      </div>


      {/* Side-by-Side Search */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parent Search */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Search Parent
            </h2>
            <p className="text-sm text-gray-600">Find parent account by email address</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter parent email address..."
                value={parentSearchEmail}
                onChange={(e) => setParentSearchEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchParentByEmail()}
                className="flex-1"
              />
              <Button onClick={searchParentByEmail} disabled={searchingParent}>
                {searchingParent ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
            
            {/* Parent Results */}
            {parentSearchResults && (
              <div className="space-y-3">
                <div className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedParent ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => handleSelectParent(parentSearchResults)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{parentSearchResults.profile?.email || parentSearchResults.parentEmail}</p>
                      <p className="text-sm text-gray-600">
                        {parentSearchResults.exists ? (
                          <><CheckCircle className="h-4 w-4 inline mr-1 text-green-600" />Existing Account</>
                        ) : (
                          <><XCircle className="h-4 w-4 inline mr-1 text-orange-600" />New Account</>
                        )}
                      </p>
                      {parentSearchResults.exists && (
                        <p className="text-xs text-gray-500">
                          {Object.keys(parentSearchResults.linkedStudents || {}).length} linked students
                        </p>
                      )}
                    </div>
                    {selectedParent && (
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Student Search */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Search Student
            </h2>
            <p className="text-sm text-gray-600">Find student to link with parent</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Search by student name, email, or ASN..."
              value={studentSearchTerm}
              onChange={(e) => setStudentSearchTerm(e.target.value)}
            />
            
            {/* Student Results */}
            {filteredStudents.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredStudents.slice(0, 10).map((student) => (
                  <div
                    key={student.StudentEmail}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedStudent?.StudentEmail === student.StudentEmail 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSelectStudent(student)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{student.fullName}</p>
                        <p className="text-sm text-gray-600">{student.StudentEmail}</p>
                        <p className="text-xs text-gray-500">
                          ASN: {student.asn || 'N/A'} • Course: {student.Course_Value}
                        </p>
                      </div>
                      {selectedStudent?.StudentEmail === student.StudentEmail && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
                {filteredStudents.length > 10 && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    Showing first 10 results. Refine search to see more.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Link Section */}
      {(selectedParent || selectedStudent) && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-purple-600" />
              Link Accounts
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Selected Parent */}
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-gray-600 mb-1">Selected Parent</p>
                {selectedParent ? (
                  <div>
                    <p className="font-medium">{selectedParent.profile?.email || selectedParent.parentEmail}</p>
                    <Badge variant={selectedParent.exists ? "default" : "secondary"} className="text-xs mt-1">
                      {selectedParent.exists ? 'Existing Account' : 'New Account'}
                    </Badge>
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No parent selected</p>
                )}
              </div>
              
              {/* Link Controls */}
              <div className="text-center space-y-3">
                {canLink && (
                  <div className="space-y-3">
                    <Select value={linkRelationship} onValueChange={setLinkRelationship}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Parent">Parent</SelectItem>
                        <SelectItem value="Mother">Mother</SelectItem>
                        <SelectItem value="Father">Father</SelectItem>
                        <SelectItem value="Guardian">Guardian</SelectItem>
                        <SelectItem value="Grandparent">Grandparent</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* Link Options */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="directLink">Direct Link (skip verification)</Label>
                        <Switch
                          id="directLink"
                          checked={directLink}
                          onCheckedChange={setDirectLink}
                        />
                      </div>
                      
                      {!directLink && (
                        <div className="flex items-center justify-between">
                          <Label htmlFor="sendWelcomeEmail">Send welcome email to parent</Label>
                          <Switch
                            id="sendWelcomeEmail"
                            checked={sendWelcomeEmail}
                            onCheckedChange={setSendWelcomeEmail}
                          />
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      onClick={handleLinkAccounts} 
                      disabled={actionLoading}
                      className="w-full"
                      size="lg"
                    >
                      {actionLoading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <LinkIcon className="h-4 w-4 mr-2" />
                      )}
                      {directLink ? 'Link Directly' : 'Create Invitation'}
                    </Button>
                  </div>
                )}
                {(selectedParent || selectedStudent) && (
                  <Button variant="outline" onClick={clearSelections} size="sm">
                    Clear Selections
                  </Button>
                )}
              </div>
              
              {/* Selected Student */}
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-gray-600 mb-1">Selected Student</p>
                {selectedStudent ? (
                  <div>
                    <p className="font-medium">{selectedStudent.fullName}</p>
                    <p className="text-sm text-gray-600">{selectedStudent.StudentEmail}</p>
                    <p className="text-xs text-gray-500">ASN: {selectedStudent.asn || 'N/A'}</p>
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No student selected</p>
                )}
              </div>
            </div>
            
            {canLink && (
              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {directLink ? (
                    <>
                      <strong>{selectedParent?.profile?.email || selectedParent?.parentEmail}</strong> will be directly linked to <strong>{selectedStudent?.fullName}</strong> without verification.
                    </>
                  ) : (
                    <>
                      An invitation will be {sendWelcomeEmail ? 'sent to' : 'created for'} <strong>{selectedParent?.profile?.email || selectedParent?.parentEmail}</strong> to link with <strong>{selectedStudent?.fullName}</strong>. 
                      The parent must verify the student's identity before the link is created.
                      {!sendWelcomeEmail && ' The parent will see the request in their dashboard.'}
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Existing Links for Selected Parent */}
      {selectedParent && selectedParent.exists && selectedParent.linkedStudents && Object.keys(selectedParent.linkedStudents).length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Existing Links</h3>
            <p className="text-sm text-gray-600">Students already linked to {selectedParent.profile?.email}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getLinkedStudentsForParent(selectedParent.linkedStudents).map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{student.fullName}</p>
                    <p className="text-sm text-gray-600">{student.relationship}</p>
                    <p className="text-xs text-gray-500">
                      Linked: {new Date(student.linkedAt).toLocaleDateString()}
                    </p>
                    {student.isRestricted && (
                      <Badge variant="destructive" className="text-xs mt-1">
                        <ShieldX className="h-3 w-3 mr-1" />
                        Restricted
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openPermissionsDialog(student.studentKey, selectedParent.parentKey, student.permissions)}
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openRestrictDialog(student.studentKey, selectedParent.parentKey, student)}
                    >
                      {student.isRestricted ? <Shield className="h-3 w-3" /> : <ShieldX className="h-3 w-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnlinkParent(student.studentKey, selectedParent.parentKey, student.fullName, selectedParent.profile?.email)}
                    >
                      <Unlink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}


      {/* Permissions Dialog */}
      <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Permissions</DialogTitle>
            <DialogDescription>
              Update parent permissions for accessing student account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {Object.entries(editingPermissions).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <Label className="capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </Label>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) => 
                    setEditingPermissions(prev => ({ ...prev, [key]: checked }))
                  }
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPermissionsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePermissions} disabled={actionLoading}>
              {actionLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restriction Dialog */}
      <Dialog open={showRestrictDialog} onOpenChange={setShowRestrictDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Account Restriction</DialogTitle>
            <DialogDescription>
              Manage parent account access restrictions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for Restriction</Label>
              <Textarea
                id="reason"
                placeholder="Enter the reason for restricting access..."
                value={restrictionReason}
                onChange={(e) => setRestrictionReason(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestrictDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => handleRestrictAccount(true)} 
              disabled={actionLoading || !restrictionReason.trim()}
            >
              {actionLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Restrict Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParentStudentManagement;