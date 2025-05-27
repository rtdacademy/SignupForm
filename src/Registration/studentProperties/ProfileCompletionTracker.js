import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { 
  User, 
  MapPin, 
  GraduationCap, 
  Users, 
  Flag, 
  FileText,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Edit2,
  Shield
} from 'lucide-react';

import {
  PersonalInfoEditor,
  AddressEditor,
  AcademicInfoEditor,
  GuardianInfoEditor,
  StatusEditor,
  DocumentsEditor
} from './index';

import {
  getStudentRequirements,
  calculateCompletionStats,
  getMissingFields,
  FIELD_IMPORTANCE,
  CATEGORY_INFO
} from './studentRequirements';

// Icon mapping
const iconMap = {
  User: User,
  MapPin: MapPin,
  GraduationCap: GraduationCap,
  Users: Users,
  Flag: Flag,
  FileText: FileText
};

// Editor component mapping
const editorMap = {
  personal: PersonalInfoEditor,
  address: AddressEditor,
  academic: AcademicInfoEditor,
  guardian: GuardianInfoEditor,
  status: StatusEditor,
  documents: DocumentsEditor
};

const ProfileCompletionTracker = ({ studentData, onUpdate, hideMainProgress = false }) => {
  const [editingCategory, setEditingCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // Calculate completion statistics
  const stats = useMemo(() => calculateCompletionStats(studentData), [studentData]);
  const missingPasiFields = useMemo(() => 
    getMissingFields(studentData, FIELD_IMPORTANCE.PASI_REQUIRED), 
    [studentData]
  );
  const missingRequiredFields = useMemo(() => 
    getMissingFields(studentData, FIELD_IMPORTANCE.REQUIRED), 
    [studentData]
  );

  const handleCategoryClick = (category) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
  };

  const handleUpdate = (updatedStudentData) => {
    onUpdate(updatedStudentData);
    setEditingCategory(null);
  };

  const renderEditor = () => {
    if (!editingCategory) return null;

    const EditorComponent = editorMap[editingCategory];
    if (!EditorComponent) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setEditingCategory(null)} />
          <div className="relative w-full max-w-2xl">
            <EditorComponent
              studentData={studentData}
              onUpdate={handleUpdate}
              onCancel={() => setEditingCategory(null)}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderFieldStatus = (field, fieldInfo) => {
    const importanceColors = {
      [FIELD_IMPORTANCE.PASI_REQUIRED]: 'text-red-600',
      [FIELD_IMPORTANCE.REQUIRED]: 'text-orange-600',
      [FIELD_IMPORTANCE.RECOMMENDED]: 'text-yellow-600',
      [FIELD_IMPORTANCE.OPTIONAL]: 'text-gray-500'
    };

    const importanceLabels = {
      [FIELD_IMPORTANCE.PASI_REQUIRED]: 'PASI Required',
      [FIELD_IMPORTANCE.REQUIRED]: 'Required',
      [FIELD_IMPORTANCE.RECOMMENDED]: 'Recommended',
      [FIELD_IMPORTANCE.OPTIONAL]: 'Optional'
    };

    return (
      <div className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded">
        <div className="flex items-center gap-3">
          {fieldInfo.hasValue ? (
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
          ) : (
            <AlertCircle className={`h-4 w-4 ${importanceColors[fieldInfo.importance]} flex-shrink-0`} />
          )}
          <div>
            <span className="text-sm font-medium">{fieldInfo.label}</span>
            {!fieldInfo.hasValue && (
              <Badge 
                variant="outline" 
                className={`ml-2 text-xs ${importanceColors[fieldInfo.importance]}`}
              >
                {importanceLabels[fieldInfo.importance]}
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCategoryCard = (category, categoryStats) => {
    const info = CATEGORY_INFO[category];
    const Icon = iconMap[info.icon];
    const isExpanded = expandedCategories.has(category);
    const completionPercentage = Math.round(
      (categoryStats.completed / categoryStats.total) * 100
    );
    const hasEditor = !!editorMap[category];

    return (
      <Card key={category} className="overflow-hidden">
        <CardHeader 
          className="cursor-pointer hover:bg-gray-50"
          onClick={() => handleCategoryClick(category)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold">{info.title}</h3>
                <p className="text-sm text-gray-600">{info.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">
                  {categoryStats.completed} / {categoryStats.total} complete
                </p>
                <Progress value={completionPercentage} className="w-24 h-2 mt-1" />
              </div>
              <ChevronRight 
                className={`h-5 w-5 text-gray-400 transition-transform ${
                  isExpanded ? 'rotate-90' : ''
                }`}
              />
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0">
            <div className="border-t pt-4">
              {Object.entries(categoryStats.fields).map(([fieldName, fieldInfo]) => 
                renderFieldStatus(fieldName, fieldInfo)
              )}
              
              {hasEditor && (
                <div className="mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(category);
                    }}
                    className="w-full"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit {info.title}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    );
  };
  return (
    <div className="space-y-6">
      {/* Overall Progress Section - Only show if hideMainProgress is false */}
      {!hideMainProgress && (
        <>
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                Profile Completion
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Overall Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Overall Completion</span>
                    <span className="text-sm font-bold">{stats.completionPercentage}%</span>
                  </div>
                  <Progress value={stats.completionPercentage} className="h-3" />
                </div>

                {/* PASI Readiness */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">PASI Registration Readiness</span>
                    <span className="text-sm font-bold">{stats.pasiCompletionPercentage}%</span>
                  </div>
                  <Progress 
                    value={stats.pasiCompletionPercentage} 
                    className={`h-3 ${stats.pasiCompletionPercentage === 100 ? 'bg-green-100' : ''}`}
                  />
                  {stats.pasiCompletionPercentage < 100 && (
                    <p className="text-xs text-red-600 mt-1">
                      {stats.pasiRequired - stats.pasiCompleted} required field(s) missing for PASI registration
                    </p>
                  )}
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
                    <p className="text-xs text-gray-600">Fields Complete</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{stats.total - stats.completed}</p>
                    <p className="text-xs text-gray-600">Fields Missing</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.pasiCompleted}</p>
                    <p className="text-xs text-gray-600">PASI Ready</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Missing PASI Fields Alert */}
          {Object.keys(missingPasiFields).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Action Required:</strong> The following information is required for Alberta Education (PASI) registration:
                <ul className="list-disc pl-5 mt-2">
                  {Object.entries(missingPasiFields).map(([category, fields]) => (
                    <li key={category}>
                      <strong>{CATEGORY_INFO[category].title}:</strong>{' '}
                      {Object.values(fields).map(f => f.label).join(', ')}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </>
      )}

      {/* Category Cards */}
      <div className="space-y-4">
        {Object.entries(stats.byCategory).map(([category, categoryStats]) =>
          renderCategoryCard(category, categoryStats)
        )}
      </div>

      {/* Editor Modal */}
      {renderEditor()}
    </div>
  );
};

export default ProfileCompletionTracker;