import React, { useState, useEffect } from 'react';
import { AlertCircle, Settings } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import JsonDisplay from '../components/JsonDisplay';

const FirebaseCourseConfig = ({ courseId }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseConfig = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        const functions = getFunctions();
        const getCourseConfig = httpsCallable(functions, 'getCourseConfigV2');
        
        const result = await getCourseConfig({ courseId });
        
        if (result.data.success) {
          setConfig(result.data.courseConfig);
          setError(null);
        } else {
          setError(result.data.message || result.data.error);
          setConfig(null);
        }
      } catch (err) {
        console.error('Error fetching course config:', err);
        setError('Failed to fetch course configuration');
        setConfig(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseConfig();
  }, [courseId]);

  if (loading) {
    return (
      <JsonDisplay 
        data={null}
        title="Course Configuration"
        subtitle="Loading course configuration..."
      />
    );
  }

  if (error) {
    return (
      <JsonDisplay 
        data={{ error: error }}
        title="Course Configuration Error"
        subtitle={error}
        filePath={`functions/courses-config/${courseId}/course-config.json`}
      />
    );
  }

  if (!config) {
    return null;
  }

  return (
    <JsonDisplay 
      data={config}
      title="Course Configuration"
      subtitle="Hardcoded course settings from functions folder"
      filePath={`functions/courses-config/${courseId}/course-config.json`}
    />
  );
};

export default FirebaseCourseConfig;