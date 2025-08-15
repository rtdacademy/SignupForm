import React, { useState, useEffect } from 'react';
import { ref, update, get, onValue } from 'firebase/database';
import { getDatabase } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../components/ui/collapsible';
import { 
  FaCreditCard, 
  FaClock, 
  FaFileInvoice, 
  FaStripe,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle
} from 'react-icons/fa';
import { 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  MinusCircle,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';
import { PAYMENT_STATUS_OPTIONS, getPaymentStatusColor } from '../config/DropdownOptions';
import { toast } from 'sonner';

const PaymentInfo = ({ 
  studentKey,
  courseId, 
  paymentStatus,
  paymentDetails,
  readOnly = false,
  onPaymentStatusUpdate
}) => {
  const [paymentData, setPaymentData] = useState(null);
  const [legacyData, setLegacyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invoicesExpanded, setInvoicesExpanded] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(paymentStatus);
  const [copiedInvoiceId, setCopiedInvoiceId] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // Format date helper
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency helper
  const formatCurrency = (cents) => {
    if (cents == null) return '$0.00';
    const dollars = cents / 100;
    return `$${dollars.toFixed(2)}`;
  };

  // Copy to clipboard helper
  const copyToClipboard = async (text, invoiceId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedInvoiceId(invoiceId);
      toast.success('Invoice link copied to clipboard!');
      setTimeout(() => setCopiedInvoiceId(null), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  // Fetch payment data from new structure
  useEffect(() => {
    const fetchPaymentData = async () => {
      if (!studentKey || !courseId) return;
      
      setLoading(true);
      const db = getDatabase();
      
      try {
        // Fetch from new payment structure
        const paymentRef = ref(db, `payments/${studentKey}/courses/${courseId}`);
        const paymentSnapshot = await get(paymentRef);
        
        if (paymentSnapshot.exists()) {
          const data = paymentSnapshot.val();
          setPaymentData(data);
        }
      } catch (error) {
        console.error('Error fetching payment data:', error);
        toast.error('Failed to load payment information');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [studentKey, courseId]);

  // Set up realtime listener for payment status
  useEffect(() => {
    if (!studentKey || !courseId) return;

    const db = getDatabase();
    const statusRef = ref(db, `students/${studentKey}/courses/${courseId}/payment_status/status`);
    
    // Set up realtime listener
    const unsubscribe = onValue(statusRef, (snapshot) => {
      if (snapshot.exists()) {
        const status = snapshot.val();
        setCurrentStatus(status);
      } else {
        // If no status exists, use the prop or default to 'unpaid'
        setCurrentStatus(paymentStatus || 'unpaid');
      }
    }, (error) => {
      console.error('Error listening to payment status:', error);
      // Fallback to prop value if listener fails
      setCurrentStatus(paymentStatus || 'unpaid');
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [studentKey, courseId, paymentStatus]);

  // Update payment_status in database
  const updatePaymentStatusV2 = async (status) => {
    const db = getDatabase();
    const updates = {
      [`students/${studentKey}/courses/${courseId}/payment_status/status`]: status,
      [`students/${studentKey}/courses/${courseId}/payment_status/last_updated`]: Date.now()
    };
    
    try {
      await update(ref(db, '/'), updates);
    } catch (error) {
      console.error('Error updating payment_status:', error);
    }
  };

  // Handle manual status change
  const handleStatusChange = async (newStatus) => {
    const db = getDatabase();
    const updates = {
      // Update in students path
      [`students/${studentKey}/courses/${courseId}/payment_status/status`]: newStatus,
      [`students/${studentKey}/courses/${courseId}/payment_status/last_updated`]: Date.now(),
      // Also update in payments path
      [`payments/${studentKey}/courses/${courseId}/status`]: newStatus,
      [`payments/${studentKey}/courses/${courseId}/last_updated`]: Date.now()
    };
    
    try {
      await update(ref(db, '/'), updates);
      // Status will be updated via the realtime listener
      if (onPaymentStatusUpdate) {
        onPaymentStatusUpdate(newStatus);
      }
      toast.success('Payment status updated successfully');
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  // Handle sync with Stripe
  const handleSyncWithStripe = async () => {
    setSyncing(true);
    
    try {
      // Get the student's email from the database
      const db = getDatabase();
      const profileRef = ref(db, `students/${studentKey}/profile`);
      const profileSnapshot = await get(profileRef);
      
      if (!profileSnapshot.exists()) {
        throw new Error('Student profile not found');
      }
      
      const profile = profileSnapshot.val();
      const userEmail = profile.StudentEmail || profile.ParentEmail;
      
      if (!userEmail) {
        throw new Error('No email found for student');
      }
      
      console.log('Syncing payment data for:', userEmail, 'course:', courseId);
      
      // Call the cloud function
      const syncFunction = httpsCallable(functions, 'syncStripePaymentStatusV2');
      const result = await syncFunction({ userEmail, courseId });
      
      if (result.data.success) {
        toast.success(result.data.message || 'Payment data synced successfully');
        
        // Reload payment data
        const paymentRef = ref(db, `payments/${studentKey}/courses/${courseId}`);
        const paymentSnapshot = await get(paymentRef);
        
        if (paymentSnapshot.exists()) {
          const data = paymentSnapshot.val();
          setPaymentData(data);
          setLegacyData(null); // Clear legacy data since we now have new data
          
          // Determine status from payment data
          let determinedStatus = 'unpaid';
          if (data.type === 'subscription') {
            if (data.status === 'paid' || (data.status === 'canceled' && data.payment_count >= data.final_payment_count)) {
              determinedStatus = 'paid';
            } else if (data.status === 'active') {
              determinedStatus = 'active';
            } else if (data.status === 'canceled') {
              determinedStatus = 'unpaid';
            }
          } else if (data.type === 'one_time') {
            determinedStatus = data.status === 'paid' ? 'paid' : 'unpaid';
          }
          
          // Update payment_status in both locations
          const db2 = getDatabase();
          const updates = {
            [`students/${studentKey}/courses/${courseId}/payment_status/status`]: determinedStatus,
            [`students/${studentKey}/courses/${courseId}/payment_status/last_updated`]: Date.now(),
            [`payments/${studentKey}/courses/${courseId}/status`]: determinedStatus,
            [`payments/${studentKey}/courses/${courseId}/last_updated`]: Date.now()
          };
          await update(ref(db2, '/'), updates);
          // Status will be updated via the realtime listener
        }
      } else {
        toast.error(result.data.message || 'Failed to sync payment data');
      }
    } catch (error) {
      console.error('Error syncing with Stripe:', error);
      toast.error('Failed to sync with Stripe: ' + (error.message || 'Unknown error'));
    } finally {
      setSyncing(false);
    }
  };

  // Get status icon and color
  const getStatusDisplay = () => {
    if (!paymentData && !legacyData && !currentStatus) {
      return { icon: AlertCircle, color: '#6B7280', label: 'No Payment Data' };
    }

    const status = currentStatus || 'unpaid';
    
    switch (status) {
      case 'paid':
        return { icon: CheckCircle2, color: '#10B981', label: 'Paid' };
      case 'active':
        return { icon: Clock, color: '#3B82F6', label: 'Active Subscription' };
      case 'unpaid':
        return { icon: XCircle, color: '#EF4444', label: 'Unpaid' };
      case 'not-required':
        return { icon: MinusCircle, color: '#9CA3AF', label: 'Not Required' };
      default:
        return { icon: AlertCircle, color: '#6B7280', label: status };
    }
  };

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading payment information...</div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 -mx-4 h-full">
      <div className="space-y-6 px-4 pb-4">
        {/* Main Status Display */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <StatusIcon 
              className="h-6 w-6" 
              style={{ color: statusDisplay.color }}
            />
            <div>
              <h3 className="text-lg font-semibold">Payment Status</h3>
              <p className="text-sm text-gray-500">
                {paymentData?.courseName || courseId ? `Course ${courseId}` : ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!readOnly && (
              <Button
                onClick={handleSyncWithStripe}
                disabled={syncing}
                variant="outline"
                size="sm"
                title={paymentData ? "Refresh payment data from Stripe" : "Sync payment data with Stripe"}
              >
                {syncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {paymentData ? 'Refreshing...' : 'Syncing...'}
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {paymentData ? 'Refresh' : 'Sync with Stripe'}
                  </>
                )}
              </Button>
            )}
            
            {!readOnly ? (
              <Select
                value={currentStatus || ''}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status">
                    {currentStatus && (
                      <span 
                        className="capitalize font-medium"
                        style={{ color: getPaymentStatusColor(currentStatus) }}
                      >
                        {currentStatus}
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUS_OPTIONS.map(option => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      style={{ color: option.color }}
                      className="capitalize font-medium"
                    >
                      {option.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Badge
                className="px-3 py-1"
                style={{ 
                  backgroundColor: `${statusDisplay.color}20`,
                  color: statusDisplay.color,
                  borderColor: `${statusDisplay.color}40`
                }}
              >
                {statusDisplay.label}
              </Badge>
            )}
          </div>
        </div>

        {/* Payment Data Display */}
        {paymentData ? (
          <>
            {/* Payment Summary Card */}
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
              {paymentData.type === 'subscription' ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      {/* Check if this is a completed 3-payment plan */}
                      {paymentData.cancellation_reason === 'completed_3_payments' || 
                       (paymentData.payment_count >= 3 && paymentData.final_payment_count <= 3) ? (
                        <>
                          <p className="text-sm text-gray-600">Payment Complete</p>
                          <p className="text-2xl font-bold text-green-600">
                            ✓ Fully Paid
                          </p>
                          <p className="text-sm text-green-600 mt-1">
                            {paymentData.payment_count} of {paymentData.payment_count} payments completed - no further charges
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-gray-600">Subscription Progress</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {paymentData.payment_count || 0} of {paymentData.final_payment_count || '?'} payments
                          </p>
                          {paymentData.canceled_at && paymentData.cancellation_reason !== 'completed_3_payments' && (
                            <p className="text-sm text-orange-600 mt-1">
                              Canceled on {formatDate(paymentData.canceled_at)}
                              {paymentData.cancellation_reason && (
                                <span className="text-xs block">
                                  Reason: {paymentData.cancellation_reason.replace(/_/g, ' ')}
                                </span>
                              )}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Paid</p>
                      <p className="text-xl font-semibold text-green-600">
                        {formatCurrency(
                          paymentData.invoices?.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0) || 0
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(
                          ((paymentData.payment_count || 0) / (paymentData.final_payment_count || 1)) * 100,
                          100
                        )}%` 
                      }}
                    />
                  </div>

                  {/* Period Dates */}
                  {paymentData.current_period_start && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Current Period</p>
                        <p className="font-medium">
                          {formatDate(paymentData.current_period_start)} - {formatDate(paymentData.current_period_end)}
                        </p>
                      </div>
                      {paymentData.subscription_id && (
                        <div>
                          <p className="text-gray-500">Subscription ID</p>
                          <p className="font-mono text-xs">{paymentData.subscription_id}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                // One-time payment display
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">One-time Payment</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(paymentData.amount_paid)}
                      </p>
                    </div>
                    <FaCheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  {paymentData.payment_date && (
                    <p className="text-sm text-gray-600">
                      Paid on {formatDate(paymentData.payment_date)}
                    </p>
                  )}
                  {paymentData.receipt_url && (
                    <a
                      href={paymentData.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <FaFileInvoice className="h-4 w-4" />
                      View Receipt
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}
            </Card>

            {/* Stripe Dashboard Links */}
            {paymentData.stripe_links && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {paymentData.stripe_links.customer && (
                  <Button
                    onClick={() => window.open(paymentData.stripe_links.customer, '_blank')}
                    className="bg-[#635bff] hover:bg-[#4d45d6] text-white flex items-center justify-center gap-2"
                    size="sm"
                  >
                    <FaStripe className="h-4 w-4" />
                    Customer
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
                {paymentData.stripe_links.subscription && (
                  <Button
                    onClick={() => window.open(paymentData.stripe_links.subscription, '_blank')}
                    className="bg-[#635bff] hover:bg-[#4d45d6] text-white flex items-center justify-center gap-2"
                    size="sm"
                  >
                    <FaClock className="h-4 w-4" />
                    Subscription
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
                {paymentData.stripe_links.latest_invoice && (
                  <Button
                    onClick={() => window.open(paymentData.stripe_links.latest_invoice, '_blank')}
                    className="bg-[#635bff] hover:bg-[#4d45d6] text-white flex items-center justify-center gap-2"
                    size="sm"
                  >
                    <FaFileInvoice className="h-4 w-4" />
                    Latest Invoice
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}

            {/* Invoice History (Collapsible) */}
            {paymentData.invoices && paymentData.invoices.length > 0 && (
              <Collapsible open={invoicesExpanded} onOpenChange={setInvoicesExpanded}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="font-medium">
                    Invoice History ({paymentData.invoices.length} invoices)
                  </span>
                  {invoicesExpanded ? <ChevronUp /> : <ChevronDown />}
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <div className="mb-2 text-xs text-gray-500 flex items-center gap-1">
                    <Copy className="h-3 w-3" />
                    Click copy icon to share invoice link with customer
                  </div>
                  <div className="space-y-2">
                    {paymentData.invoices
                      .sort((a, b) => (b.paid_at || 0) - (a.paid_at || 0))
                      .map((invoice, index) => (
                        <Card key={invoice.id || index} className="p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{formatCurrency(invoice.amount_paid)}</p>
                                {invoice.status && (
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs"
                                    style={{
                                      borderColor: invoice.status === 'paid' ? '#10B981' : 
                                                  invoice.status === 'open' ? '#F59E0B' : 
                                                  invoice.status === 'draft' ? '#6B7280' : '#6B7280',
                                      color: invoice.status === 'paid' ? '#10B981' : 
                                            invoice.status === 'open' ? '#F59E0B' : 
                                            invoice.status === 'draft' ? '#6B7280' : '#6B7280'
                                    }}
                                  >
                                    {invoice.status}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">
                                {formatDate(invoice.paid_at || invoice.created)}
                              </p>
                              <p className="text-xs text-gray-400 font-mono">{invoice.id}</p>
                            </div>
                            <div className="flex gap-2">
                              {/* Dashboard link for staff */}
                              {invoice.stripe_dashboard_url && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(invoice.stripe_dashboard_url, '_blank')}
                                  title="View in Stripe Dashboard"
                                >
                                  <FaStripe className="h-4 w-4 mr-1" />
                                  Dashboard
                                </Button>
                              )}
                              {/* Copy customer invoice link */}
                              {invoice.hosted_invoice_url && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(invoice.hosted_invoice_url, invoice.id)}
                                  title="Copy customer invoice link"
                                >
                                  {copiedInvoiceId === invoice.id ? (
                                    <Check className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                              {/* PDF link if available */}
                              {invoice.invoice_pdf && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => window.open(invoice.invoice_pdf, '_blank')}
                                  title="Download PDF"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Customer ID Display */}
            {paymentData.customer_id && (
              <div className="text-xs text-gray-500">
                Customer ID: {paymentData.customer_id}
              </div>
            )}
          </>
        ) : legacyData ? (
          // Legacy Data Display
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-yellow-900">Legacy Payment Data</p>
                <p className="text-sm text-yellow-700 mt-1">
                  This student has payment information in the old format. Use the "Sync with Stripe" button above to update.
                </p>
                <div className="mt-3 space-y-2 text-sm">
                  <p>Status: <span className="font-medium">{legacyData.status}</span></p>
                  <p>Last Updated: {formatDate(legacyData.last_updated)}</p>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          // No Payment Data
          <Card className="p-4 bg-gray-50">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No Payment Information</p>
              <p className="text-sm text-gray-500 mt-1">
                No payment data found for this course enrollment. Use the "Sync with Stripe" button above to search for payments.
              </p>
            </div>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
};

export default PaymentInfo;