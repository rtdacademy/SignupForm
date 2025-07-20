import { useState, useEffect } from 'react';
import { getEstimatedTime, formatEstimatedTime } from '../utils/courseUtils';

/**
 * Hook to get lesson configuration data from course config
 * @param {String} courseId - ID of the course (e.g., "2")
 * @param {String} contentPath - Content path of the lesson (e.g., "01-physics-20-review")
 * @returns {Object} Object containing estimatedTime, formattedTime, loading, and error
 */
export const useLessonConfig = (courseId, contentPath) => {
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [formattedTime, setFormattedTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTime = async () => {
      if (!courseId || !contentPath) {
        setEstimatedTime(null);
        setFormattedTime('');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const time = await getEstimatedTime(courseId, contentPath);
        setEstimatedTime(time);
        setFormattedTime(time ? formatEstimatedTime(time) : '');
      } catch (err) {
        setError(err);
        console.error('Error loading lesson config:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTime();
  }, [courseId, contentPath]);

  return {
    estimatedTime,
    formattedTime,
    loading,
    error
  };
};

/**
 * Hook to get lesson metadata object compatible with LessonContent component
 * @param {String} courseId - ID of the course (e.g., "2")
 * @param {String} contentPath - Content path of the lesson (e.g., "01-physics-20-review")
 * @returns {Object} Metadata object with estimated_time property
 */
export const useLessonMetadata = (courseId, contentPath) => {
  const { formattedTime, loading, error } = useLessonConfig(courseId, contentPath);

  return {
    metadata: {
      estimated_time: formattedTime || 'Loading...'
    },
    loading,
    error
  };
};

export default useLessonConfig;