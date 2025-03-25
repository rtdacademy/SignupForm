import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import LTILoginTester from './LTILoginTester';

const LTIManagement = () => {
  const { hasAdminAccess } = useAuth();
  const baseUrl = 'https://us-central1-rtd-academy.cloudfunctions.net';
  const ltiBaseUrl = 'https://edge.rtdacademy.com'

  if (!hasAdminAccess()) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You do not have permission to access LTI management.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>LTI Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <LTILoginTester 
            baseUrl={baseUrl}
            ltiBaseUrl = {ltiBaseUrl}
            />
            {/* Additional components can be added here in the future */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LTIManagement;