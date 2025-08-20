import React, { useState } from 'react';
import { 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaFileAlt, 
  FaLink, 
  FaCode,
  FaCalculator,
  FaBook,
  FaFile,
  FaSave,
  FaTimes
} from 'react-icons/fa';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { generateUniqueId } from '../utils/firebaseCourseConfigUtils';

const ResourcesTab = ({ resources = {}, onUpdate, isEditing }) => {
  const [editingResource, setEditingResource] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'url',
    url: '',
    embedCode: ''
  });
  const [errors, setErrors] = useState([]);

  // Resource type options
  const resourceTypes = [
    { value: 'url', label: 'External Link', icon: FaLink },
    { value: 'embed', label: 'Embedded Content', icon: FaCode },
    { value: 'pdf', label: 'PDF Document', icon: FaFileAlt }
  ];

  // Get icon for resource type
  const getResourceIcon = (type) => {
    switch (type) {
      case 'embed':
        if (formData.title?.toLowerCase().includes('calculator')) {
          return FaCalculator;
        }
        return FaCode;
      case 'pdf':
        return FaFileAlt;
      case 'url':
      default:
        if (formData.title?.toLowerCase().includes('textbook') || 
            formData.title?.toLowerCase().includes('book')) {
          return FaBook;
        }
        return FaLink;
    }
  };

  // Validate resource data
  const validateResource = (data) => {
    const errors = [];
    
    if (!data.title?.trim()) {
      errors.push('Title is required');
    }
    
    if (!data.description?.trim()) {
      errors.push('Description is required');
    }
    
    if (data.type === 'embed' && !data.embedCode?.trim()) {
      errors.push('Embed code is required for embedded content');
    }
    
    if ((data.type === 'url' || data.type === 'pdf') && !data.url?.trim()) {
      errors.push('URL is required');
    }
    
    // Validate URL format
    if (data.url && !data.url.match(/^https?:\/\/.+/)) {
      errors.push('URL must start with http:// or https://');
    }
    
    // Validate embed code contains iframe
    if (data.type === 'embed' && data.embedCode && !data.embedCode.includes('<iframe')) {
      errors.push('Embed code must contain an iframe element');
    }
    
    return errors;
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors([]); // Clear errors on input change
  };

  // Handle add new resource
  const handleAddResource = () => {
    const validationErrors = validateResource(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const resourceId = formData.title
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '');
    
    const newResource = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      type: formData.type,
      ...(formData.type === 'embed' 
        ? { embedCode: formData.embedCode.trim() }
        : { url: formData.url.trim() }
      ),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedResources = {
      ...resources,
      [resourceId]: newResource
    };

    onUpdate(updatedResources);
    setShowAddForm(false);
    resetForm();
  };

  // Handle edit resource
  const handleEditResource = (resourceId) => {
    const resource = resources[resourceId];
    setEditingResource(resourceId);
    setFormData({
      title: resource.title || '',
      description: resource.description || '',
      type: resource.type || 'url',
      url: resource.url || '',
      embedCode: resource.embedCode || ''
    });
    setShowAddForm(true);
  };

  // Handle save edited resource
  const handleSaveEdit = () => {
    const validationErrors = validateResource(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const updatedResource = {
      ...resources[editingResource],
      title: formData.title.trim(),
      description: formData.description.trim(),
      type: formData.type,
      ...(formData.type === 'embed' 
        ? { embedCode: formData.embedCode.trim(), url: undefined }
        : { url: formData.url.trim(), embedCode: undefined }
      ),
      updatedAt: new Date().toISOString()
    };

    const updatedResources = {
      ...resources,
      [editingResource]: updatedResource
    };

    onUpdate(updatedResources);
    setEditingResource(null);
    setShowAddForm(false);
    resetForm();
  };

  // Handle delete resource
  const handleDeleteResource = (resourceId) => {
    if (!window.confirm(`Are you sure you want to delete "${resources[resourceId].title}"?`)) {
      return;
    }

    const updatedResources = { ...resources };
    delete updatedResources[resourceId];
    onUpdate(updatedResources);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'url',
      url: '',
      embedCode: ''
    });
    setErrors([]);
    setEditingResource(null);
  };

  // Cancel form
  const handleCancel = () => {
    setShowAddForm(false);
    resetForm();
  };

  const resourceEntries = Object.entries(resources);

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="text-md font-semibold">Course Resources</h4>
          <p className="text-sm text-gray-600 mt-1">
            Manage resources like calculators, data booklets, and textbooks for this course.
          </p>
        </div>
        {isEditing && !showAddForm && (
          <Button
            onClick={() => setShowAddForm(true)}
            className="flex items-center"
            size="sm"
          >
            <FaPlus className="mr-2" />
            Add Resource
          </Button>
        )}
      </div>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            <ul className="list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h5 className="font-semibold mb-4">
            {editingResource ? 'Edit Resource' : 'Add New Resource'}
          </h5>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., TI-84 Online Calculator"
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the resource"
                rows={2}
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Resource Type *</label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {resourceTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* URL field for url and pdf types */}
            {(formData.type === 'url' || formData.type === 'pdf') && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  {formData.type === 'pdf' ? 'PDF URL *' : 'Resource URL *'}
                </label>
                <Input
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  placeholder="https://example.com/resource"
                  disabled={!isEditing}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.type === 'pdf' 
                    ? 'Direct link to the PDF file'
                    : 'External link to the resource'}
                </p>
              </div>
            )}

            {/* Embed code field for embed type */}
            {formData.type === 'embed' && (
              <div>
                <label className="block text-sm font-medium mb-1">Embed Code *</label>
                <Textarea
                  value={formData.embedCode}
                  onChange={(e) => handleInputChange('embedCode', e.target.value)}
                  placeholder='<iframe src="..." width="100%" height="800px"></iframe>'
                  rows={4}
                  disabled={!isEditing}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste the iframe embed code provided by the service
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
              >
                <FaTimes className="mr-1" />
                Cancel
              </Button>
              <Button
                onClick={editingResource ? handleSaveEdit : handleAddResource}
                size="sm"
                disabled={!isEditing}
              >
                <FaSave className="mr-1" />
                {editingResource ? 'Save Changes' : 'Add Resource'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Resources List */}
      <div className="space-y-3">
        {resourceEntries.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <FaFile className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500">No resources added yet</p>
            {isEditing && (
              <p className="text-sm text-gray-400 mt-1">
                Click "Add Resource" to get started
              </p>
            )}
          </div>
        ) : (
          resourceEntries.map(([resourceId, resource]) => {
            const IconComponent = getResourceIcon(resource.type);
            return (
              <div
                key={resourceId}
                className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      <IconComponent className="text-blue-500 text-lg" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{resource.title}</h5>
                      <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-500 capitalize">
                          Type: {resource.type}
                        </span>
                        {resource.url && (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View Resource →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {isEditing && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => handleEditResource(resourceId)}
                        variant="outline"
                        size="sm"
                      >
                        <FaEdit className="mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteResource(resourceId)}
                        variant="destructive"
                        size="sm"
                      >
                        <FaTrash className="mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h5 className="font-medium text-blue-900 mb-2">Resource Types</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>External Link:</strong> Links to external websites or resources</li>
          <li>• <strong>Embedded Content:</strong> Interactive content like calculators that can be embedded</li>
          <li>• <strong>PDF Document:</strong> Direct links to PDF files like data booklets or guides</li>
        </ul>
      </div>
    </div>
  );
};

export default ResourcesTab;