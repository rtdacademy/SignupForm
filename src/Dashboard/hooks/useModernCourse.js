import { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';

export const useModernCourse = (courseId) => {
  const [isModernCourse, setIsModernCourse] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkModernCourse = async () => {
      if (!courseId) {
        setLoading(false);
        return;
      }

      try {
        const db = getDatabase();
        const courseRef = ref(db, `courses/${courseId}/modernCourse`);
        const snapshot = await get(courseRef);
        
        setIsModernCourse(snapshot.exists() && snapshot.val() === true);
        setError(null);
      } catch (err) {
        console.error('Error checking modern course:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    checkModernCourse();
  }, [courseId]);

  return { isModernCourse, loading, error };
};