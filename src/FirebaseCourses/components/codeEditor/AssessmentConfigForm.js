import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Switch } from '../../../components/ui/switch';
import { Separator } from '../../../components/ui/separator';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Trash2, Plus, AlertCircle, Save } from 'lucide-react';

/**
 * Assessment Configuration Form Component
 * Provides a UI for configuring AI Multiple Choice and AI Long Answer assessments
 */
const AssessmentConfigForm = ({
  assessmentType,
  config = {},
  onSave,
  onCancel,
  loading = false,
  title = "Configure Assessment"
}) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [errors, setErrors] = useState({});

  // Update local config when prop changes
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  // Handle config changes
  const handleConfigChange = (path, value) => {
    const newConfig = { ...localConfig };
    
    // Handle nested paths like 'prompts.beginner'
    const keys = path.split('.');
    let current = newConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    
    setLocalConfig(newConfig);
    // Only update parent on save, not on every keystroke
  };

  // Validate configuration
  const validateConfig = () => {
    const newErrors = {};
    
    // Common validations
    if (!localConfig.prompts?.intermediate?.trim()) {
      newErrors.prompts = 'At least an intermediate prompt is required';
    }
    
    if (assessmentType === 'ai-multiple-choice') {
      if (localConfig.maxAttempts && localConfig.maxAttempts < 1) {
        newErrors.maxAttempts = 'Max attempts must be at least 1';
      }
      if (localConfig.pointsValue && localConfig.pointsValue < 0) {
        newErrors.pointsValue = 'Points value cannot be negative';
      }
    } else if (assessmentType === 'ai-long-answer') {
      if (localConfig.maxAttempts && localConfig.maxAttempts < 1) {
        newErrors.maxAttempts = 'Max attempts must be at least 1';
      }
      if (localConfig.totalPoints && localConfig.totalPoints < 1) {
        newErrors.totalPoints = 'Total points must be at least 1';
      }
      if (localConfig.wordLimits) {
        if (localConfig.wordLimits.min >= localConfig.wordLimits.max) {
          newErrors.wordLimits = 'Minimum words must be less than maximum words';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (validateConfig()) {
      onSave?.(localConfig);
    }
  };

  // Render prompts section
  const renderPromptsSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">AI Prompts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {['beginner', 'intermediate', 'advanced'].map(difficulty => (
          <div key={difficulty} className="space-y-2">
            <Label className="capitalize">{difficulty} Prompt</Label>
            <Textarea
              value={localConfig.prompts?.[difficulty] || ''}
              onChange={(e) => handleConfigChange(`prompts.${difficulty}`, e.target.value)}
              placeholder={`Create a ${difficulty} level question about this topic...`}
              rows={3}
              className={errors.prompts && difficulty === 'intermediate' ? 'border-red-500' : ''}
            />
          </div>
        ))}
        {errors.prompts && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.prompts}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  // Render activity settings section
  const renderActivitySettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Activity Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Activity Type</Label>
            <Select 
              value={localConfig.activityType || 'lesson'} 
              onValueChange={(value) => handleConfigChange('activityType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lesson">Lesson</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
                <SelectItem value="exam">Exam</SelectItem>
                <SelectItem value="lab">Lab</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select 
              value={localConfig.theme || 'purple'} 
              onValueChange={(value) => handleConfigChange('theme', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="purple">Purple</SelectItem>
                <SelectItem value="amber">Amber</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Max Attempts</Label>
            <Input
              type="number"
              value={localConfig.maxAttempts || ''}
              onChange={(e) => handleConfigChange('maxAttempts', parseInt(e.target.value) || null)}
              placeholder={assessmentType === 'ai-multiple-choice' ? '999' : '3'}
              min="1"
              className={errors.maxAttempts ? 'border-red-500' : ''}
            />
            {errors.maxAttempts && (
              <p className="text-sm text-red-500">{errors.maxAttempts}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>
              {assessmentType === 'ai-multiple-choice' ? 'Points Value' : 'Total Points'}
            </Label>
            <Input
              type="number"
              value={assessmentType === 'ai-multiple-choice' 
                ? (localConfig.pointsValue || '') 
                : (localConfig.totalPoints || '')
              }
              onChange={(e) => handleConfigChange(
                assessmentType === 'ai-multiple-choice' ? 'pointsValue' : 'totalPoints', 
                parseInt(e.target.value) || null
              )}
              placeholder={assessmentType === 'ai-multiple-choice' ? '5' : '10'}
              min="1"
              className={
                (assessmentType === 'ai-multiple-choice' && errors.pointsValue) ||
                (assessmentType === 'ai-long-answer' && errors.totalPoints) 
                ? 'border-red-500' : ''
              }
            />
            {assessmentType === 'ai-multiple-choice' && errors.pointsValue && (
              <p className="text-sm text-red-500">{errors.pointsValue}</p>
            )}
            {assessmentType === 'ai-long-answer' && errors.totalPoints && (
              <p className="text-sm text-red-500">{errors.totalPoints}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Render feature toggles section
  const renderFeatureToggles = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Features</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable AI Chat</Label>
              <p className="text-sm text-gray-500">Allow students to chat with AI for help</p>
            </div>
            <Switch 
              checked={localConfig.enableAIChat || false}
              onCheckedChange={(value) => handleConfigChange('enableAIChat', value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>LaTeX Math Formatting</Label>
              <p className="text-sm text-gray-500">Enable mathematical notation support</p>
            </div>
            <Switch 
              checked={localConfig.katexFormatting || false}
              onCheckedChange={(value) => handleConfigChange('katexFormatting', value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Show Feedback</Label>
              <p className="text-sm text-gray-500">Display detailed answer feedback</p>
            </div>
            <Switch 
              checked={localConfig.showFeedback !== false}
              onCheckedChange={(value) => handleConfigChange('showFeedback', value)}
            />
          </div>
          
          {assessmentType === 'ai-multiple-choice' && (
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Enable Hints</Label>
                <p className="text-sm text-gray-500">Provide hints to students</p>
              </div>
              <Switch 
                checked={localConfig.enableHints !== false}
                onCheckedChange={(value) => handleConfigChange('enableHints', value)}
              />
            </div>
          )}
          
          {assessmentType === 'ai-long-answer' && (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Show Rubric</Label>
                  <p className="text-sm text-gray-500">Display grading criteria to students</p>
                </div>
                <Switch 
                  checked={localConfig.showRubric !== false}
                  onCheckedChange={(value) => handleConfigChange('showRubric', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Show Word Count</Label>
                  <p className="text-sm text-gray-500">Display live word count to students</p>
                </div>
                <Switch 
                  checked={localConfig.showWordCount !== false}
                  onCheckedChange={(value) => handleConfigChange('showWordCount', value)}
                />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Render word limits section (for long answer)
  const renderWordLimits = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Word Limits</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Minimum Words</Label>
            <Input
              type="number"
              value={localConfig.wordLimits?.min || ''}
              onChange={(e) => handleConfigChange('wordLimits.min', parseInt(e.target.value) || null)}
              placeholder="100"
              min="1"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Maximum Words</Label>
            <Input
              type="number"
              value={localConfig.wordLimits?.max || ''}
              onChange={(e) => handleConfigChange('wordLimits.max', parseInt(e.target.value) || null)}
              placeholder="500"
              min="1"
            />
          </div>
        </div>
        {errors.wordLimits && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.wordLimits}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  // Render AI chat context section
  const renderAIChatContext = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">AI Chat Context</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label>Context Information</Label>
          <Textarea
            value={localConfig.aiChatContext || ''}
            onChange={(e) => handleConfigChange('aiChatContext', e.target.value)}
            placeholder="Provide context to help AI tutors assist students with this assessment..."
            rows={3}
          />
          <p className="text-sm text-gray-500">
            This information helps AI tutors provide better assistance to students
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-gray-500">
            Configure your {assessmentType === 'ai-multiple-choice' ? 'AI Multiple Choice' : 'AI Long Answer'} assessment
          </p>
        </div>
        <Badge variant="outline" className="capitalize">
          {assessmentType?.replace('-', ' ')}
        </Badge>
      </div>

      <Tabs defaultValue="prompts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="prompts" className="mt-6">
          {renderPromptsSection()}
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6 space-y-6">
          {renderActivitySettings()}
          {assessmentType === 'ai-long-answer' && renderWordLimits()}
        </TabsContent>
        
        <TabsContent value="features" className="mt-6">
          {renderFeatureToggles()}
        </TabsContent>
        
        <TabsContent value="advanced" className="mt-6">
          {renderAIChatContext()}
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AssessmentConfigForm;