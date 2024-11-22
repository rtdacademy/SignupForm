import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { XCircle } from "lucide-react";

const CancelledPayment = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center space-y-4">
          <XCircle className="h-12 w-12 mx-auto text-amber-500" />
          <h2 className="text-xl font-semibold text-gray-900">Payment Not Completed</h2>
          <p className="text-gray-500">
            Your payment was not completed. This could be because:
          </p>
          <ul className="text-sm text-gray-500 text-left list-disc pl-6 space-y-1">
            <li>You cancelled the payment process</li>
            <li>There was an issue with your payment method</li>
            <li>The payment window was closed before completion</li>
          </ul>
          <div className="space-y-3 pt-2">
            <Button 
              onClick={() => window.history.back()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Try Payment Again
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CancelledPayment;