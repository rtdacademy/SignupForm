import React, { useState, useEffect } from 'react';
import { 
  FaExclamationTriangle
} from 'react-icons/fa';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import CourseStructureBuilder from './CourseStructureBuilder';
import ResourcesTab from './ResourcesTab';
import JsonDisplay from '../components/JsonDisplay';
import {
  loadCourseConfig,
  saveCourseConfig,
  validateCourseConfig,
  getDefaultCourseConfig
} from '../utils/firebaseCourseConfigUtils';

const FirebaseCourseConfigEditor = ({ courseId, courseData, isEditing }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [activeTab, setActiveTab] = useState('structure');

  // Load configuration on mount
  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true);
      const result = await loadCourseConfig(courseId);
      
      if (result.success) {
        // Merge with course title from courseData and ensure attemptLimits exist
        const loadedConfig = {
          ...result.config,
          title: courseData?.Title || result.config.title,
          // Ensure attemptLimits exist with defaults if not present
          attemptLimits: result.config.attemptLimits || {
            lesson: 999,
            assignment: 3,
            exam: 1,
            quiz: 2,
            lab: 3
          }
        };
        setConfig(loadedConfig);
      } else {
        toast.error('Failed to load course configuration');
        // Use default config as fallback
        const defaultConfig = getDefaultCourseConfig(courseId, courseData?.Title || 'New Course');
        setConfig(defaultConfig);
      }
      
      setLoading(false);
    };

    if (courseId) {
      loadConfig();
    }
  }, [courseId, courseData?.Title]);

  // Validate configuration
  useEffect(() => {
    if (config) {
      const validationErrors = validateCourseConfig(config);
      setErrors(validationErrors);
    }
  }, [config]);

  // Auto-save configuration changes
  useEffect(() => {
    const saveConfig = async () => {
      if (config && !loading && isEditing) {
        const result = await saveCourseConfig(courseId, config);
        if (result.success) {
          toast.success('Configuration saved');
        } else {
          toast.error('Failed to save configuration');
        }
      }
    };

    // Debounce saves by 1 second
    const timeoutId = setTimeout(saveConfig, 1000);
    return () => clearTimeout(timeoutId);
  }, [config, courseId, loading, isEditing]);

  // Update handlers

  const updateWeights = (weights) => {
    setConfig(prev => ({
      ...prev,
      weights
    }));
  };

  const updateAttemptLimits = (attemptLimits) => {
    setConfig(prev => ({
      ...prev,
      attemptLimits
    }));
  };

  const updateStructure = (courseStructure) => {
    setConfig(prev => ({
      ...prev,
      courseStructure
    }));
  };

  const updateResources = (resources) => {
    setConfig(prev => ({
      ...prev,
      courseOutline: {
        ...prev.courseOutline,
        resources
      }
    }));
  };

  // Handle full configuration import
  const handleFullConfigImport = (importedConfig) => {
    // Validate the imported config
    const validationErrors = validateCourseConfig(importedConfig);
    if (validationErrors.length > 0) {
      toast.error(`Import validation failed: ${validationErrors[0]}`);
      return false;
    }

    // Merge with current courseId and title from courseData
    const mergedConfig = {
      ...importedConfig,
      courseId: courseId, // Keep current courseId
      title: courseData?.Title || importedConfig.title,
      metadata: {
        ...importedConfig.metadata,
        lastUpdated: new Date().toISOString(),
        importedAt: new Date().toISOString()
      }
    };

    // Update the configuration
    setConfig(mergedConfig);
    
    // Save to database
    saveCourseConfig(courseId, mergedConfig).then(result => {
      if (result.success) {
        toast.success('Full configuration imported and saved successfully!');
      } else {
        toast.error('Failed to save imported configuration');
      }
    });

    return true;
  };

  // Make the import handler available globally for CourseStructureBuilder
  useEffect(() => {
    window.updateFullCourseConfig = handleFullConfigImport;
    return () => {
      delete window.updateFullCourseConfig;
    };
  }, [courseId, courseData]);

  if (loading) {
    return (
      <div className="p-4 text-center">
        Loading configuration...
      </div>
    );
  }

  if (!config) {
    return (
      <Alert className="m-4">
        <FaExclamationTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load course configuration. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">

      {/* Validation Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <FaExclamationTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-1">Configuration errors:</div>
            <ul className="list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="structure">Structure</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="weights">Weights</TabsTrigger>
          <TabsTrigger value="attempts">Attempts</TabsTrigger>
          <TabsTrigger value="json">JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="structure">
          <CourseStructureBuilder
            courseId={courseId}
            structure={config.courseStructure || {}}
            onUpdate={updateStructure}
            isEditing={isEditing}
          />
        </TabsContent>

        <TabsContent value="resources">
          <ResourcesTab
            resources={config.courseOutline?.resources || {}}
            onUpdate={updateResources}
            isEditing={isEditing}
          />
        </TabsContent>

        <TabsContent value="weights">
          <WeightsTab
            weights={config.weights || {}}
            onUpdate={updateWeights}
            isEditing={isEditing}
          />
        </TabsContent>

        <TabsContent value="attempts">
          <AttemptsTab
            attemptLimits={config.attemptLimits || {}}
            onUpdate={updateAttemptLimits}
            isEditing={isEditing}
          />
        </TabsContent>

        <TabsContent value="json">
          <JsonDisplay
            data={config}
            title="Course Configuration JSON"
            subtitle="Complete configuration in JSON format"
            filePath={`Database: /courses/${courseId}/course-config/`}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};


// Weights Tab Component
const WeightsTab = ({ weights, onUpdate, isEditing }) => {
  const handleWeightChange = (category, value) => {
    const numValue = parseFloat(value) || 0;
    onUpdate({
      ...weights,
      [category]: numValue
    });
  };

  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  const isValidTotal = Math.abs(totalWeight - 1) < 0.001 || totalWeight === 0;

  return (
    <div className="p-4 space-y-4">
      <div>
        <h4 className="text-md font-semibold mb-4">Grade Category Weights</h4>
        <p className="text-sm text-gray-600 mb-4">
          Set the weight for each category. Weights must sum to 1.0 (100%) or 0 for ungraded courses.
        </p>
      </div>

      <div className="space-y-3">
        {Object.entries(weights).map(([category, weight]) => (
          <div key={category} className="flex items-center gap-4">
            <label className="w-32 text-sm font-medium capitalize">
              {category}
            </label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={weight}
              onChange={(e) => handleWeightChange(category, e.target.value)}
              disabled={!isEditing}
              className="w-24 p-2 border rounded-md"
            />
            <span className="text-sm text-gray-600">
              {(weight * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>

      <div className={`p-3 rounded-md ${isValidTotal ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
        <div className="flex items-center justify-between">
          <span className="font-medium">Total Weight:</span>
          <span>{(totalWeight * 100).toFixed(1)}%</span>
        </div>
        {!isValidTotal && (
          <p className="text-sm mt-1">
            Weights must sum to 100% or 0% for ungraded courses.
          </p>
        )}
      </div>
    </div>
  );
};

// Attempts Tab Component
const AttemptsTab = ({ attemptLimits, onUpdate, isEditing }) => {
  const handleAttemptChange = (sessionType, value) => {
    const numValue = parseInt(value) || 1;
    const clampedValue = Math.max(1, Math.min(999, numValue));
    onUpdate({
      ...attemptLimits,
      [sessionType]: clampedValue
    });
  };

  const sessionTypeDescriptions = {
    lesson: 'Interactive content with knowledge checks and questions',
    assignment: 'Practice assignments with multiple questions',
    exam: 'Formal examinations and tests',
    quiz: 'Short quizzes and knowledge checks',
    lab: 'Laboratory activities and simulations'
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h4 className="text-md font-semibold mb-4">Session Attempt Limits</h4>
        <p className="text-sm text-gray-600 mb-4">
          Set the maximum number of attempts students can make for each session type.
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(attemptLimits).map(([sessionType, attempts]) => (
          <div key={sessionType} className="p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-4 mb-2">
              <label className="w-24 text-sm font-medium capitalize">
                {sessionType}
              </label>
              <input
                type="number"
                min="1"
                max="999"
                value={attempts}
                onChange={(e) => handleAttemptChange(sessionType, e.target.value)}
                disabled={!isEditing}
                className="w-20 p-2 border rounded-md"
              />
              <span className="text-sm text-gray-600">
                {attempts === 999 ? 'Unlimited' : `${attempts} attempt${attempts === 1 ? '' : 's'}`}
              </span>
            </div>
            <p className="text-xs text-gray-500 ml-28">
              {sessionTypeDescriptions[sessionType]}
            </p>
          </div>
        ))}
      </div>

      <div className="p-3 bg-blue-50 text-blue-800 rounded-md">
        <p className="text-sm">
          <strong>Note:</strong> These limits apply to new sessions. Individual assessments may override these defaults with their own maxAttempts settings.
        </p>
      </div>
    </div>
  );
};

export default FirebaseCourseConfigEditor;