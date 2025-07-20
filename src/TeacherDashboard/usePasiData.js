import { useState, useCallback } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * Hook for retrieving PASI data from Cloud Storage
 * @returns {Object} Object containing data retrieval functions and state
 */
export function usePasiData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const retrieveData = useCallback(async (dataType, filePath = null) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const functions = getFunctions();
      const retrievePasiData = httpsCallable(functions, 'retrievePasiData');
      
      const result = await retrievePasiData({
        dataType,
        filePath
      });

      if (result.data.success) {
        setData(result.data.data);
        return result.data;
      } else {
        throw new Error('Failed to retrieve data');
      }
    } catch (err) {
      console.error('Error retrieving PASI data:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const retrieveLatestCourseRegistrations = useCallback(async () => {
    return retrieveData('courseRegistrations');
  }, [retrieveData]);

  const retrieveLatestSchoolEnrollments = useCallback(async () => {
    return retrieveData('schoolEnrollments');
  }, [retrieveData]);

  const retrieveLatestMergedData = useCallback(async () => {
    return retrieveData('mergedPasiData');
  }, [retrieveData]);

  const retrieveStudentData = useCallback(async (asn) => {
    setLoading(true);
    setError(null);

    try {
      const functions = getFunctions();
      const retrieveStudentPasiData = httpsCallable(functions, 'retrieveStudentPasiData');
      
      const result = await retrieveStudentPasiData({ asn });

      if (result.data.success) {
        return result.data;
      } else {
        throw new Error('Failed to retrieve student data');
      }
    } catch (err) {
      console.error('Error retrieving student PASI data:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    data,
    retrieveData,
    retrieveLatestCourseRegistrations,
    retrieveLatestSchoolEnrollments,
    retrieveLatestMergedData,
    retrieveStudentData,
    clearData
  };
}

// Example usage:
/*
import { usePasiData } from './usePasiData';

function MyComponent() {
  const { 
    loading, 
    error, 
    data, 
    retrieveLatestMergedData,
    retrieveStudentData
  } = usePasiData();

  const handleLoadMergedData = async () => {
    try {
      const result = await retrieveLatestMergedData();
      console.log(`Loaded data for ${result.recordCount} students from ${result.filePath}`);
      // data is now structured as: { asn: { schoolEnrollment, courseRegistrations, metadata } }
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  const handleLoadStudent = async () => {
    try {
      const result = await retrieveStudentData('123456789'); // ASN
      console.log(`Student has ${result.courseCount} courses and ${result.hasSchoolEnrollment ? 'has' : 'no'} enrollment`);
      // result.data contains: { asn, schoolEnrollment, courseRegistrations, metadata }
    } catch (err) {
      console.error('Failed to load student:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <button onClick={handleLoadMergedData}>Load All PASI Data</button>
      <button onClick={handleLoadStudent}>Load Specific Student</button>
      {data && <div>Data loaded successfully</div>}
    </div>
  );
}
*/