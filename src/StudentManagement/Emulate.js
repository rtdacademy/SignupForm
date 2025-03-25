import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Dashboard from '../Dashboard/Dashboard';

const Emulate = () => {
  const navigate = useNavigate();
  const { studentEmail } = useParams();
  const { isStaffUser, startEmulation, isEmulating } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!isStaffUser) {
      navigate('/teacher-dashboard');
      return;
    }

    const initializeEmulation = async () => {
      try {
        const success = await startEmulation(studentEmail);
        if (!success) {
          navigate('/teacher-dashboard');
        }
      } catch (error) {
        console.error('Error initializing emulation:', error);
        navigate('/teacher-dashboard');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeEmulation();
  }, [isStaffUser, studentEmail, startEmulation, navigate]);

  if (isInitializing || !isEmulating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing emulation...</p>
        </div>
      </div>
    );
  }

  return <Dashboard />;
};

export default Emulate;