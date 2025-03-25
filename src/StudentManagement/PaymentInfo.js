import React from 'react';
import { ref, update } from 'firebase/database';
import { getDatabase } from 'firebase/database';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  FaCreditCard, 
  FaClock, 
  FaFileInvoice, 
  FaStripe
} from 'react-icons/fa';
import { PAYMENT_STATUS_OPTIONS, getPaymentStatusColor } from '../config/DropdownOptions';
import { toast } from 'sonner';

const PaymentInfo = ({ 
  studentKey,
  courseId, 
  paymentStatus,
  paymentDetails,
  readOnly = false 
}) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (cents) => {
    if (cents == null) return '$0.00';
    const dollars = cents / 100;
    return `$${dollars.toFixed(2)}`;
  };

  const handleStatusChange = async (newStatus) => {
    const db = getDatabase();
    const statusPath = `students/${studentKey}/courses/${courseId}/payment_status`;
    const updates = {
      [`${statusPath}/status`]: newStatus,
      [`${statusPath}/last_updated`]: Date.now()
    };
    
    try {
      await update(ref(db, '/'), updates);
      toast.success('Payment status updated successfully');
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  const openStripeInTab = (customerId) => {
    const stripeUrl = `https://dashboard.stripe.com/customers/${customerId}`;
    const windowName = 'stripePortal';
    const windowFeatures = 'noopener,noreferrer';
    window.open(stripeUrl, windowName, windowFeatures);
  };

  return (
    <ScrollArea className="flex-1 -mx-4 h-full">
      <div className="space-y-6 px-4 pb-4">
        {/* Status Selection */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">Payment Status</h3>
          </div>
          {!readOnly ? (
            <Select
              value={paymentStatus || ''}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status">
                  {paymentStatus && (
                    <span 
                      className="capitalize font-medium"
                      style={{ 
                        color: getPaymentStatusColor(paymentStatus)
                      }}
                    >
                      {paymentStatus}
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
              style={{ 
                backgroundColor: paymentStatus ? `${getPaymentStatusColor(paymentStatus)}20` : 'bg-gray-100',
                color: paymentStatus ? getPaymentStatusColor(paymentStatus) : 'text-gray-500',
                borderColor: paymentStatus ? `${getPaymentStatusColor(paymentStatus)}40` : 'border-gray-200'
              }}
            >
              {paymentStatus || 'No Status'}
            </Badge>
          )}
        </div>

        {/* Stripe Dashboard Button */}
        {paymentDetails?.customer_id && (
          <Button
            onClick={() => openStripeInTab(paymentDetails.customer_id)}
            className="w-full bg-[#635bff] hover:bg-[#4d45d6] text-white flex items-center justify-center gap-2 py-6"
          >
            <FaStripe className="h-6 w-6" />
            <span className="text-lg font-semibold">View in Stripe Dashboard</span>
          </Button>
        )}

        {/* Customer Info */}
        {paymentDetails?.customer_id && (
          <div className="text-xs text-gray-500">
            Customer ID: {paymentDetails.customer_id}
          </div>
        )}

        {/* Payment Details */}
        {paymentDetails && (
          <div className="space-y-4">
            {paymentDetails.type === 'subscription' ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-600">
                    <FaClock className="h-5 w-5" />
                    <span className="font-medium">Monthly Installments</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Subscription ID: {paymentDetails.subscription_id}
                  </div>
                </div>
                
                <Card className="p-4 bg-gray-50">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Payment Schedule</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Current Period</p>
                          <p className="font-medium">
                            {formatDate(paymentDetails.current_period_start)} -<br />
                            {formatDate(paymentDetails.current_period_end)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Final Payment</p>
                          <p className="font-medium">{formatDate(paymentDetails.cancel_at)}</p>
                        </div>
                      </div>
                      {paymentDetails.canceled_at && (
                        <div className="mt-2">
                          <p className="text-gray-500">Cancellation Date</p>
                          <p className="font-medium">{formatDate(paymentDetails.canceled_at)}</p>
                        </div>
                      )}
                    </div>

                    {paymentDetails.latest_invoice && (
                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-500">Latest Payment</p>
                            <p className="font-medium">{formatCurrency(paymentDetails.latest_invoice.amount_paid)}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Last updated: {formatDate(paymentDetails.last_updated)}
                            </p>
                          </div>
                          <a
                            href={paymentDetails.latest_invoice.hosted_invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <FaFileInvoice className="h-4 w-4" />
                            <span className="text-sm">View Invoice</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-600">
                    <FaCreditCard className="h-5 w-5" />
                    <span className="font-medium">One-time Payment</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Payment ID: {paymentDetails.payment_id}
                  </div>
                </div>
                
                <Card className="p-4 bg-gray-50">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Payment Date</p>
                        <p className="font-medium">{formatDate(paymentDetails.payment_date)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-medium">{formatCurrency(paymentDetails.amount_paid)}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Payment Method</p>
                          <p className="font-medium capitalize">{paymentDetails.payment_method}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Last Updated</p>
                          <p className="font-medium">{formatDate(paymentDetails.last_updated)}</p>
                        </div>
                      </div>
                    </div>

                    {paymentDetails.receipt_url && (
                      <div className="flex justify-end pt-4 border-t">
                        <a
                          href={paymentDetails.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <FaFileInvoice className="h-4 w-4" />
                          <span className="text-sm">View Receipt</span>
                        </a>
                      </div>
                    )}
                  </div>
                </Card>
              </>
            )}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default PaymentInfo;