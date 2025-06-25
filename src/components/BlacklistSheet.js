import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { 
  X, 
  Plus, 
  Edit2, 
  Trash2, 
  Save,
  AlertCircle,
  CheckCircle,
  Users,
  Calendar,
  Mail,
  FileText,
  Eye,
  ShieldX,
  Clock,
  BookOpen
} from 'lucide-react';
import { getDatabase, ref, push, update, remove, onValue, off } from 'firebase/database';
import { auth } from '../firebase';

const BlacklistSheet = ({ isOpen, onClose }) => {
  const [blacklistRecords, setBlacklistRecords] = useState([]);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [rejectionLogs, setRejectionLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewingLogsFor, setViewingLogsFor] = useState(null);
  const [formData, setFormData] = useState({
    asn: '',
    email: '',
    reason: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadBlacklistData();
    }
  }, [isOpen]);

  const loadBlacklistData = () => {
    const db = getDatabase();
    const activeRef = ref(db, 'blacklist/active');
    const historyRef = ref(db, 'blacklist/history');
    const rejectionLogRef = ref(db, 'blacklist/rejectionLog');

    setLoading(true);

    const activeUnsubscribe = onValue(activeRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const records = Object.entries(data).map(([id, record]) => ({
          id,
          ...record
        })).sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0));
        setBlacklistRecords(records);
      } else {
        setBlacklistRecords([]);
      }
      setLoading(false);
    });

    const historyUnsubscribe = onValue(historyRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const records = Object.entries(data).map(([id, record]) => ({
          id,
          ...record
        })).sort((a, b) => (b.dateRemoved || 0) - (a.dateRemoved || 0));
        setHistoryRecords(records);
      } else {
        setHistoryRecords([]);
      }
    });

    const rejectionLogUnsubscribe = onValue(rejectionLogRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const logs = Object.entries(data).map(([id, log]) => ({
          id,
          ...log,
          timestamp: log.timestamp ? new Date(log.timestamp).getTime() : 0
        })).sort((a, b) => b.timestamp - a.timestamp);
        setRejectionLogs(logs);
      } else {
        setRejectionLogs([]);
      }
    });

    return () => {
      off(activeRef, 'value', activeUnsubscribe);
      off(historyRef, 'value', historyUnsubscribe);
      off(rejectionLogRef, 'value', rejectionLogUnsubscribe);
    };
  };

  const resetForm = () => {
    setFormData({ asn: '', email: '', reason: '' });
    setEditingId(null);
    setShowAddForm(false);
    setError(null);
    setSuccess(null);
  };

  const handleAdd = async () => {
    if (!formData.asn || !formData.email || !formData.reason) {
      setError('All fields are required');
      return;
    }

    try {
      const db = getDatabase();
      const activeRef = ref(db, 'blacklist/active');
      const newRecord = {
        ...formData,
        dateAdded: Date.now(),
        addedBy: auth.currentUser?.email || 'Unknown'
      };

      await push(activeRef, newRecord);
      setSuccess('Student added to blacklist successfully');
      resetForm();
    } catch (err) {
      setError('Failed to add student to blacklist: ' + err.message);
    }
  };

  const handleEdit = (record) => {
    setFormData({
      asn: record.asn,
      email: record.email,
      reason: record.reason
    });
    setEditingId(record.id);
    setShowAddForm(true);
  };

  const handleUpdate = async () => {
    if (!formData.asn || !formData.email || !formData.reason) {
      setError('All fields are required');
      return;
    }

    try {
      const db = getDatabase();
      const recordRef = ref(db, `blacklist/active/${editingId}`);
      const updates = {
        asn: formData.asn,
        email: formData.email,
        reason: formData.reason,
        lastModified: Date.now(),
        modifiedBy: auth.currentUser?.email || 'Unknown'
      };

      await update(recordRef, updates);
      setSuccess('Blacklist record updated successfully');
      resetForm();
    } catch (err) {
      setError('Failed to update blacklist record: ' + err.message);
    }
  };

  const handleRemove = async (record) => {
    if (!window.confirm('Are you sure you want to remove this student from the blacklist?')) {
      return;
    }

    try {
      const db = getDatabase();
      const activeRef = ref(db, `blacklist/active/${record.id}`);
      const historyRef = ref(db, 'blacklist/history');

      // Add to history
      const historyRecord = {
        ...record,
        dateRemoved: Date.now(),
        removedBy: auth.currentUser?.email || 'Unknown'
      };
      await push(historyRef, historyRecord);

      // Remove from active
      await remove(activeRef);
      
      setSuccess('Student removed from blacklist');
    } catch (err) {
      setError('Failed to remove student from blacklist: ' + err.message);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString();
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  const getRejectionLogsForStudent = (record) => {
    return rejectionLogs.filter(log => 
      (record.asn && log.attemptedASN === record.asn) ||
      (record.email && log.attemptedEmail && log.attemptedEmail.toLowerCase() === record.email.toLowerCase())
    );
  };

  const handleViewLogs = (record) => {
    setViewingLogsFor(record);
  };

  const closeLogs = () => {
    setViewingLogsFor(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-semibold">Student Blacklist Management</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Add/Edit Form */}
          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  {editingId ? 'Edit Blacklist Entry' : 'Add New Blacklist Entry'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">ASN</label>
                    <Input
                      value={formData.asn}
                      onChange={(e) => setFormData({ ...formData, asn: e.target.value })}
                      placeholder="Enter ASN"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Reason for Blacklisting</label>
                  <Textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Enter reason for blacklisting this student"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={editingId ? handleUpdate : handleAdd}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {editingId ? 'Update' : 'Add to Blacklist'}
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Blacklist */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Active Blacklist ({blacklistRecords.length})
                </CardTitle>
                {!showAddForm && (
                  <Button onClick={() => setShowAddForm(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Student
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-4">Loading blacklist data...</p>
              ) : blacklistRecords.length === 0 ? (
                <p className="text-center py-4 text-gray-500">No students currently blacklisted</p>
              ) : (
                <div className="space-y-3">
                  {blacklistRecords.map((record) => (
                    <div key={record.id} className="border rounded-lg p-4 bg-red-50 border-red-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="destructive">ASN: {record.asn}</Badge>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Mail className="h-3 w-3" />
                              {record.email}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{record.reason}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Added: {formatDate(record.dateAdded)}
                            </div>
                            <span>By: {record.addedBy}</span>
                            {record.lastModified && (
                              <span>Modified: {formatDate(record.lastModified)}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(record)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemove(record)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* History */}
          {historyRecords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  Blacklist History ({historyRecords.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {historyRecords.slice(0, 10).map((record) => (
                    <div key={record.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="secondary">ASN: {record.asn}</Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          {record.email}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{record.reason}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Added: {formatDate(record.dateAdded)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Removed: {formatDate(record.dateRemoved)}
                        </div>
                        <span>Removed by: {record.removedBy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlacklistSheet;