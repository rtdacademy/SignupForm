import React, { useState, useEffect } from 'react';
import { BookOpen, AlertCircle } from 'lucide-react';
import JsonDisplay from '../components/JsonDisplay';

const FirebaseCourseStructure = ({ courseId }) => {
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseStructure = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        
        // Try to dynamically import the course structure
        try {
          const module = await import(`../FirebaseCourses/courses/${courseId}/course-structure.json`);
          const data = module.default || module;
          setStructure(data);
          setError(null);
        } catch (importError) {
          console.error('Error importing course structure:', importError);
          setError(`Course structure not found for course ${courseId}. Expected file: src/FirebaseCourses/courses/${courseId}/course-structure.json`);
          setStructure(null);
        }
      } catch (err) {
        console.error('Error fetching course structure:', err);
        setError(`Failed to load course structure: ${err.message}`);
        setStructure(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseStructure();
  }, [courseId]);

  if (loading) {
    return (
      <JsonDisplay 
        data={null}
        title="Course Structure"
        subtitle="Loading course structure..."
      />
    );
  }

  if (error) {
    return (
      <JsonDisplay 
        data={{ error: error }}
        title="Course Structure Error"
        subtitle={error}
        filePath={`src/FirebaseCourses/courses/${courseId}/course-structure.json`}
      />
    );
  }

  if (!structure) {
    return null;
  }

  return (
    <JsonDisplay 
      data={structure}
      title="Course Structure"
      subtitle="Course organization and navigation settings"
      filePath={`src/FirebaseCourses/courses/${courseId}/course-structure.json`}
    />
  );
};

export default FirebaseCourseStructure;