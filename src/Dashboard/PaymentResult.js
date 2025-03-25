import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { CheckCircle2 } from "lucide-react";

const PaymentResult = () => {
  const navigate = useNavigate();

  // Automatically redirect to dashboard after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center space-y-4">
          <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
          <h2 className="text-xl font-semibold text-green-700">Payment Successful!</h2>
          <p className="text-gray-500">Thank you for your payment. Your course is now ready.</p>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Go to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PaymentResult;