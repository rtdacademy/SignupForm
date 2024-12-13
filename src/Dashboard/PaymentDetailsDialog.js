import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Card } from "../components/ui/card";
import { FaCreditCard, FaClock, FaFileInvoice, FaExternalLinkAlt, FaCalendarAlt, FaHistory } from 'react-icons/fa';

const PaymentDetailsDialog = ({ isOpen, onOpenChange, paymentDetails }) => {
  if (!paymentDetails) return null;

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

  const renderInvoiceHistory = () => {
    if (!paymentDetails.invoices?.length) return null;

    return (
      <div className="border-t pt-6 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <FaHistory className="text-gray-500 h-4 w-4" />
          <h3 className="text-sm font-medium text-gray-700">Payment History</h3>
        </div>
        <div className="space-y-3">
          {paymentDetails.invoices.map((invoice, index) => (
            <Card key={invoice.id} className="p-3 bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">
                    {formatCurrency(invoice.amount_paid)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Paid on {formatDate(invoice.created)}
                  </p>
                </div>
                <a
                  href={invoice.hosted_invoice_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span className="text-xs">View Invoice</span>
                  <FaExternalLinkAlt className="h-2 w-2" />
                </a>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderSubscriptionDetails = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-blue-600">
        <FaClock className="h-5 w-5" />
        <span className="font-medium">Monthly Installments</span>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-500 h-4 w-4" />
            <p className="text-sm font-medium text-gray-700">Payment Schedule</p>
          </div>
          <div className="mt-2 space-y-3 pl-6">
            <div>
              <p className="text-sm text-gray-500">Last Payment</p>
              <p className="font-medium">{formatDate(paymentDetails.current_period_start)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Next Payment Date</p>
              <p className="font-medium">{formatDate(paymentDetails.current_period_end)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Final Payment Date</p>
              <p className="font-medium">{formatDate(paymentDetails.cancel_at)}</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-gray-500">Latest Payment Amount</p>
          <p className="font-medium text-lg">
            {formatCurrency(paymentDetails.latest_invoice?.amount_paid)}
          </p>
        </div>
      </div>

      {paymentDetails.latest_invoice && (
        <Card className="p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaFileInvoice className="text-gray-500" />
              <span className="text-sm font-medium">Latest Invoice</span>
            </div>
            <a
              href={paymentDetails.latest_invoice.hosted_invoice_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span className="text-sm">View Invoice</span>
              <FaExternalLinkAlt className="h-3 w-3" />
            </a>
          </div>
        </Card>
      )}

      {renderInvoiceHistory()}
    </div>
  );

  const renderOneTimePayment = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-green-600">
        <FaCreditCard className="h-5 w-5" />
        <span className="font-medium">One-time Payment</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Payment Date</p>
          <p className="font-medium">{formatDate(paymentDetails.payment_date)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Amount Paid</p>
          <p className="font-medium">{formatCurrency(paymentDetails.amount_paid)}</p>
        </div>
      </div>

      {paymentDetails.receipt_url && (
        <Card className="p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaFileInvoice className="text-gray-500" />
              <span className="text-sm font-medium">Receipt</span>
            </div>
            <a
              href={paymentDetails.receipt_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span className="text-sm">View Receipt</span>
              <FaExternalLinkAlt className="h-3 w-3" />
            </a>
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payment Details - {paymentDetails.courseName}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {paymentDetails.type === 'subscription' 
            ? renderSubscriptionDetails() 
            : renderOneTimePayment()
          }
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDetailsDialog;