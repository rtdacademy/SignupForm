import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle2, AlertCircle, Eye, Download, Send, Loader2, Calendar, User, FileText } from 'lucide-react';
import { getDatabase, ref, get, set } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../context/AuthContext';

const AdminReimbursementReview = () => {
  const { user } = useAuth();
  const [reimbursements, setReimbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPendingReimbursements();
  }, []);

  const loadPendingReimbursements = async () => {
    try {
      setLoading(true);
      const db = getDatabase();
      const queueRef = ref(db, 'adminReimbursementQueue');
      const snapshot = await get(queueRef);
      
      if (snapshot.exists()) {
        const queueData = snapshot.val();
        const reimbursementList = Object.values(queueData)
          .filter(item => item.status === 'pending_review')
          .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        
        setReimbursements(reimbursementList);
      } else {
        setReimbursements([]);
      }
    } catch (error) {
      console.error('Error loading reimbursements:', error);
      setError('Failed to load pending reimbursements');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReimbursement = async (reimbursement) => {
    if (processing[reimbursement.id]) return;

    setProcessing(prev => ({ ...prev, [reimbursement.id]: true }));

    try {
      // Update reimbursement status to approved
      const db = getDatabase();
      const reimbursementRef = ref(db, `homeEducationFamilies/familyInformation/${reimbursement.familyId}/REIMBURSEMENTS/${reimbursement.schoolYear.replace('/', '_')}/${reimbursement.studentId}/${reimbursement.id}`);
      const queueRef = ref(db, `adminReimbursementQueue/${reimbursement.id}`);
      
      // Update both locations
      await Promise.all([
        set(ref(db, `${reimbursementRef.key}/status`), 'approved'),
        set(ref(db, `${reimbursementRef.key}/approvedBy`), user.uid),
        set(ref(db, `${reimbursementRef.key}/approvedAt`), new Date().toISOString()),
        set(ref(db, `${queueRef.key}/status`), 'approved'),
        set(ref(db, `${queueRef.key}/approvedBy`), user.uid),
        set(ref(db, `${queueRef.key}/approvedAt`), new Date().toISOString())
      ]);

      // Remove from pending list
      setReimbursements(prev => prev.filter(item => item.id !== reimbursement.id));
      
    } catch (error) {
      console.error('Error approving reimbursement:', error);
      setError(`Failed to approve reimbursement: ${error.message}`);
    } finally {
      setProcessing(prev => ({ ...prev, [reimbursement.id]: false }));
    }
  };

  const handleProcessPayout = async (familyId, selectedReimbursements) => {
    if (bulkProcessing) return;

    setBulkProcessing(true);
    setError(null);

    try {
      const functions = getFunctions();
      const processPayoutFunction = httpsCallable(functions, 'processReimbursementPayout');
      
      const totalAmount = selectedReimbursements.reduce((sum, item) => sum + item.amount, 0);
      const reimbursementIds = selectedReimbursements.map(item => item.id);
      
      const result = await processPayoutFunction({
        familyId: familyId,
        reimbursementIds: reimbursementIds,
        totalAmount: totalAmount,
        description: `Bulk payout for ${selectedReimbursements.length} approved reimbursements`
      });

      if (result.data.success) {
        // Remove processed items from the list
        setReimbursements(prev => 
          prev.filter(item => !reimbursementIds.includes(item.id))
        );
        setSelectedItems([]);
        alert(`Payout processed successfully! Transfer ID: ${result.data.transferId}`);
      }
    } catch (error) {
      console.error('Error processing payout:', error);
      setError(`Failed to process payout: ${error.message}`);
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleSelectItem = (reimbursementId) => {
    setSelectedItems(prev => 
      prev.includes(reimbursementId)
        ? prev.filter(id => id !== reimbursementId)
        : [...prev, reimbursementId]
    );
  };

  const groupedReimbursements = reimbursements.reduce((groups, item) => {
    const key = item.familyId;
    if (!groups[key]) {
      groups[key] = {
        familyId: key,
        familyName: item.studentName?.split(' ').slice(0, -1).join(' ') + ' Family' || 'Unknown Family',
        items: [],
        totalAmount: 0
      };
    }
    groups[key].items.push(item);
    groups[key].totalAmount += item.amount;
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading reimbursements...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reimbursement Review & Payout</h1>
        <p className="text-gray-600">Review submitted reimbursements and process payouts through Stripe Connect</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {reimbursements.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-600">No pending reimbursements to review.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.values(groupedReimbursements).map(family => (
            <div key={family.familyId} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{family.familyName}</h3>
                    <p className="text-sm text-gray-600">
                      {family.items.length} reimbursement{family.items.length !== 1 ? 's' : ''} • 
                      Total: ${family.totalAmount.toFixed(2)} CAD
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        const approvedItems = family.items.filter(item => item.status === 'approved');
                        if (approvedItems.length > 0) {
                          handleProcessPayout(family.familyId, approvedItems);
                        } else {
                          alert('No approved reimbursements to process for this family.');
                        }
                      }}
                      disabled={bulkProcessing || family.items.every(item => item.status !== 'approved')}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {bulkProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>Process Payout</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {family.items.map(item => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{item.studentName}</h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.category}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.status === 'approved' ? 'bg-green-100 text-green-800' :
                            item.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.status === 'pending_review' ? 'Pending Review' : 
                             item.status === 'approved' ? 'Approved' : item.status}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-2">{item.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>${item.amount.toFixed(2)} CAD</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(item.purchaseDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FileText className="w-4 h-4" />
                            <span>{item.receiptFiles?.length || 0} receipt{(item.receiptFiles?.length || 0) !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {item.status === 'pending_review' && (
                          <button
                            onClick={() => handleApproveReimbursement(item)}
                            disabled={processing[item.id]}
                            className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            {processing[item.id] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                            <span>Approve</span>
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            // Could implement receipt viewing here
                            alert('Receipt viewing feature would be implemented here');
                          }}
                          className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReimbursementReview;