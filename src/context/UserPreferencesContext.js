import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDatabase, ref, get, set } from 'firebase/database';
import { useAuth } from './AuthContext';
import { MODES } from './ModeContext';

const UserPreferencesContext = createContext();

// Helper functions for date handling
const serializeDate = (date) => date ? date.getTime() : null;
const deserializeDate = (timestamp) => timestamp ? new Date(timestamp) : null;

const serializeDateFilters = (filters) => {
  if (!filters?.dateFilters) return filters;
  
  const serializedDateFilters = {};
  Object.entries(filters.dateFilters).forEach(([key, value]) => {
    if (value?.between) {
      serializedDateFilters[key] = {
        between: {
          start: serializeDate(value.between.start),
          end: serializeDate(value.between.end)
        }
      };
    } else if (value?.after) {
      serializedDateFilters[key] = {
        after: serializeDate(value.after)
      };
    } else if (value?.before) {
      serializedDateFilters[key] = {
        before: serializeDate(value.before)
      };
    }
  });

  return {
    ...filters,
    dateFilters: serializedDateFilters
  };
};

const deserializeDateFilters = (filters) => {
  if (!filters?.dateFilters) return filters;

  const deserializedDateFilters = {};
  Object.entries(filters.dateFilters).forEach(([key, value]) => {
    if (value?.between) {
      deserializedDateFilters[key] = {
        between: {
          start: deserializeDate(value.between.start),
          end: deserializeDate(value.between.end)
        }
      };
    } else if (value?.after) {
      deserializedDateFilters[key] = {
        after: deserializeDate(value.after)
      };
    } else if (value?.before) {
      deserializedDateFilters[key] = {
        before: deserializeDate(value.before)
      };
    }
  });

  return {
    ...filters,
    dateFilters: deserializedDateFilters
  };
};

export function useUserPreferences() {
  return useContext(UserPreferencesContext);
}

const DEFAULT_PREFERENCES = {
  selectedTabs: {
    registration: ['registration', 'notes'],
    default: ['notes', 'schedule', 'gradebook']
  },
  filters: {
    currentMode: MODES.TEACHER,
    searchTerm: '',
    categories: [],
    hasSchedule: [],
    migrationStatus: 'all',
    statusFilters: {},
    dateFilters: {}
  },
  schoolYear: {
    includeNextYear: false,
    includePreviousYear: false
  },
  lastViewedStudent: null
};

export function UserPreferencesProvider({ children }) {
  const { user, user_email_key, isStaffUser } = useAuth();
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get reference to user's preferences in Firebase
  const getPreferencesRef = () => {
    const db = getDatabase();
    const prefsPath = isStaffUser ? 
      `staff/${user_email_key}/preferences` : 
      `users/${user.uid}/preferences`;
    return ref(db, prefsPath);
  };

  // Initialize preferences
  useEffect(() => {
    if (!user || !user_email_key) {
      setPreferences(null);
      setLoading(false);
      return;
    }

    const prefsRef = getPreferencesRef();

    get(prefsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          // Deserialize dates when loading from Firebase
          const prefs = deserializeDateFilters(snapshot.val());
          setPreferences(prefs);
        } else {
          setPreferences(DEFAULT_PREFERENCES);
          set(prefsRef, DEFAULT_PREFERENCES);
        }
      })
      .catch((error) => {
        console.error('Error loading preferences:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, user_email_key, isStaffUser]);

  // Update entire preferences object
  const updatePreferences = async (newPrefs) => {
    if (!user || !user_email_key) return;

    try {
      const prefsRef = getPreferencesRef();
      // Serialize dates before saving to Firebase
      const serializedPrefs = serializeDateFilters(newPrefs);
      await set(prefsRef, serializedPrefs);
      
      // Keep the deserialized version in state
      setPreferences(newPrefs);
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  };

  // Update only filter preferences
  const updateFilterPreferences = async (newFilters) => {
    if (!preferences) return;
    
    // Clean the newFilters object to remove any undefined values
    const cleanFilters = Object.fromEntries(
      Object.entries(newFilters).filter(([_, value]) => value !== undefined)
    );
    
    const updatedPrefs = {
      ...preferences,
      filters: {
        ...preferences.filters,
        ...cleanFilters
      }
    };
    
    await updatePreferences(updatedPrefs);
  };

  // Clear all filters while preserving mode
  const clearAllFilters = async () => {
    if (!preferences) return;
    
    // Get the current mode
    const currentMode = preferences.filters.currentMode || MODES.TEACHER;
    
    const clearedFilters = {
      currentMode,
      categories: [],
      hasSchedule: [],
      dateFilters: {},
      searchTerm: '',
      // Clear all other filter arrays
      ...Object.keys(preferences.filters).reduce((acc, key) => {
        if (!['currentMode', 'dateFilters', 'hasSchedule', 'categories', 'searchTerm'].includes(key)) {
          acc[key] = [];
        }
        return acc;
      }, {})
    };
  
    // Update the entire preferences object but only modify the filters
    const updatedPrefs = {
      ...preferences,
      filters: clearedFilters
    };
  
    try {
      await updatePreferences(updatedPrefs);
    } catch (error) {
      console.error('Error clearing filters:', error);
    }
  };

  // Update selected tabs
  const updateSelectedTabs = async (mode, tabs) => {
    if (!preferences) return;

    const updatedPrefs = {
      ...preferences,
      selectedTabs: {
        ...preferences.selectedTabs,
        [mode]: tabs
      }
    };

    await updatePreferences(updatedPrefs);
  };

  // Update last viewed student
  const updateLastViewedStudent = async (studentId) => {
    if (!preferences) return;

    const updatedPrefs = {
      ...preferences,
      lastViewedStudent: studentId
    };

    await updatePreferences(updatedPrefs);
  };

  // Update school year preferences
  const updateSchoolYearPreferences = async (schoolYearSettings) => {
    if (!preferences) return;

    // Filter out undefined values to prevent Firebase errors
    const cleanSettings = Object.fromEntries(
      Object.entries(schoolYearSettings).filter(([_, value]) => value !== undefined)
    );

    const updatedPrefs = {
      ...preferences,
      schoolYear: {
        ...preferences.schoolYear,
        ...cleanSettings
      }
    };

    await updatePreferences(updatedPrefs);
  };

  const value = {
    preferences,
    updatePreferences,
    updateFilterPreferences,
    clearAllFilters,
    updateSelectedTabs,
    updateLastViewedStudent,
    updateSchoolYearPreferences,
    loading
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {!loading && children}
    </UserPreferencesContext.Provider>
  );
}