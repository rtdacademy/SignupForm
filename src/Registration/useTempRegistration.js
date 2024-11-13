// useTempRegistration.js
import { useState, useEffect } from 'react';
import { getDatabase, ref, get, set, remove } from 'firebase/database';
import { useAuth } from '../context/AuthContext';

export const useTempRegistration = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tempData, setTempData] = useState(null);
  const [error, setError] = useState(null);

  const getTempRegRef = () => {
    const db = getDatabase();
    return ref(db, `users/${user.uid}/tempRegistration`);
  };

  // Load temp registration data
  const loadTempRegistration = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const snapshot = await get(getTempRegRef());
      if (snapshot.exists()) {
        setTempData(snapshot.val());
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading temp registration:', err);
    } finally {
      setLoading(false);
    }
  };

  // Save temp registration data
  const saveTempRegistration = async (data) => {
    if (!user) return;

    try {
      setLoading(true);
      await set(getTempRegRef(), {
        ...data,
        lastUpdated: Date.now()
      });
      setTempData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error saving temp registration:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear temp registration data
  const clearTempRegistration = async () => {
    if (!user) return;

    try {
      setLoading(true);
      await remove(getTempRegRef());
      setTempData(null);
    } catch (err) {
      setError(err.message);
      console.error('Error clearing temp registration:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load temp data on mount
  useEffect(() => {
    if (user) {
      loadTempRegistration();
    }
  }, [user]);

  return {
    tempData,
    loading,
    error,
    saveTempRegistration,
    clearTempRegistration,
    loadTempRegistration
  };
};

// Initial temp registration structure
export const getInitialTempRegistration = (studentType) => ({
  studentType,
  registrationStep: 'form',
  created: Date.now(),
  lastUpdated: Date.now(),
  formData: {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    currentSchool: '',
    schoolAddress: null,
    birthday: '',
    enrollmentYear: '',
    albertaStudentNumber: '',
    courseId: '',
    courseName: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    startDate: '',
    endDate: '',
    additionalInformation: '',
    diplomaMonth: null,
    age: null
  }
});