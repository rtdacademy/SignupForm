import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '../../components/ui/sheet';
import {
  Tag,
  Plus,
  X,
  ChevronDown,
  Sparkles,
  Info,
  Activity,
  CheckSquare,
  Package
} from 'lucide-react';

const PortfolioTagSelector = ({
  selectedTags = { activities: [], assessments: [], resources: [] },
  onChange,
  activities = [],
  assessments = [],
  resources = [],
  activityDescriptions = {},
  assessmentDescriptions = {},
  resourceDescriptions = {},
  getTagSuggestions,
  content = '',
  compact = false,
  customActivities = [],
  customAssessments = [],
  customResources = []
}) => {
  const [suggestions, setSuggestions] = useState({
    activities: [],
    assessments: [],
    resources: []
  });
  const [activeCategory, setActiveCategory] = useState('activities');
  const [showAllTags, setShowAllTags] = useState(false);

  const normalizeCustomItems = (items) => {
    if (!items) return {};
    const values = Array.isArray(items)
      ? items
      : typeof items === 'object' && items !== null
        ? Object.values(items)
        : [];
    return values.reduce((acc, item) => {
      if (item && item.key) {
        acc[item.key] = item.name || item.label || item.key;
      }
      return acc;
    }, {});
  };

  const customNameLookup = {
    activities: normalizeCustomItems(customActivities),
    assessments: normalizeCustomItems(customAssessments),
    resources: normalizeCustomItems(customResources)
  };

  // Get AI suggestions based on content
  useEffect(() => {
    if (getTagSuggestions && content && content.length > 10) {
      const newSuggestions = getTagSuggestions(content);
      setSuggestions(newSuggestions);
    }
  }, [content, getTagSuggestions]);

  // Toggle tag selection
  const toggleTag = (category, tag) => {
    const currentTags = selectedTags[category] || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    onChange({
      ...selectedTags,
      [category]: newTags
    });
  };

  // Get display name for tag
  const getTagDisplayName = (tag, category) => {
    if (category && customNameLookup[category]?.[tag]) {
      return customNameLookup[category][tag];
    }

    if (typeof tag !== 'string') return '';

    // Remove underscores and capitalize
    return tag.replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get tag description
  const getTagDescription = (category, tag) => {
    if (category === 'activities') return activityDescriptions[tag];
    if (category === 'assessments') return assessmentDescriptions[tag];
    if (category === 'resources') return resourceDescriptions[tag];
    return '';
  };

  // Get tags for category (no filtering needed since we removed search)
  const getFilteredTags = (category) => {
    if (category === 'activities') return activities;
    if (category === 'assessments') return assessments;
    if (category === 'resources') return resources;
    return [];
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'activities':
        return <Activity className="w-4 h-4" />;
      case 'assessments':
        return <CheckSquare className="w-4 h-4" />;
      case 'resources':
        return <Package className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  // Get category color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'activities':
        return 'blue';
      case 'assessments':
        return 'green';
      case 'resources':
        return 'purple';
      default:
        return 'gray';
    }
  };

  // Count total selected tags
  const getTotalSelectedCount = () => {
    return (selectedTags.activities?.length || 0) +
           (selectedTags.assessments?.length || 0) +
           (selectedTags.resources?.length || 0);
  };

  // Tag selector content (used in both full and sheet views)
  const TagSelectorContent = () => (
    <div className="h-full flex flex-col">
      {/* Category tabs */}
      <div className="flex border-b flex-shrink-0">
        {['activities', 'assessments', 'resources'].map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`
              flex-1 px-3 py-2 text-sm font-medium capitalize
              ${activeCategory === category
                ? 'border-b-2 border-purple-500 text-purple-600'
                : 'text-gray-600 hover:text-gray-900'}
            `}
          >
            <div className="flex items-center justify-center space-x-1">
              {getCategoryIcon(category)}
              <span>{category}</span>
              {selectedTags[category]?.length > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full bg-${getCategoryColor(category)}-100 text-${getCategoryColor(category)}-700`}>
                  {selectedTags[category].length}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* AI Suggestions */}
      {suggestions[activeCategory]?.length > 0 && (
        <div className="p-3 bg-purple-50 border-b">
          <div className="flex items-center mb-2">
            <Sparkles className="w-4 h-4 text-purple-600 mr-2" />
            <span className="text-sm font-medium text-purple-900">AI Suggestions</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {suggestions[activeCategory].slice(0, 3).map((tag, index) => (
              <button
                key={index}
                onClick={() => toggleTag(activeCategory, tag)}
                className={`
                  inline-flex items-center px-2 py-1 rounded-full text-xs
                  ${selectedTags[activeCategory]?.includes(tag)
                    ? `bg-${getCategoryColor(activeCategory)}-600 text-white`
                    : `bg-white border border-${getCategoryColor(activeCategory)}-300 text-${getCategoryColor(activeCategory)}-700 hover:bg-${getCategoryColor(activeCategory)}-50`
                  }
                `}
              >
                {getTagDisplayName(tag, activeCategory)}
                {selectedTags[activeCategory]?.includes(tag) && (
                  <X className="w-3 h-3 ml-1" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tags list - flex-1 to fill remaining height */}
      <div className="flex-1 p-3 overflow-y-auto min-h-0">
        <div className="space-y-1">
          {getFilteredTags(activeCategory).map((tag) => {
            const isSelected = selectedTags[activeCategory]?.includes(tag);
            const description = getTagDescription(activeCategory, tag);
            const isSuggested = suggestions[activeCategory]?.includes(tag);
            
            return (
              <button
                key={tag}
                onClick={() => toggleTag(activeCategory, tag)}
                className={`
                  w-full p-2 rounded-lg text-left transition-colors
                  ${isSelected 
                    ? `bg-${getCategoryColor(activeCategory)}-100 border-2 border-${getCategoryColor(activeCategory)}-400` 
                    : 'hover:bg-gray-50 border-2 border-transparent'}
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${isSelected ? `text-${getCategoryColor(activeCategory)}-900` : 'text-gray-900'}`}>
                        {getTagDisplayName(tag, activeCategory)}
                      </span>
                      {isSuggested && (
                        <Sparkles className="w-3 h-3 text-purple-500 ml-2" />
                      )}
                    </div>
                    {description && (
                      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                    )}
                  </div>
                  <div className="ml-2">
                    {isSelected ? (
                      <div className={`w-5 h-5 rounded-full bg-${getCategoryColor(activeCategory)}-500 flex items-center justify-center`}>
                        <X className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Compact view for smaller spaces
  if (compact) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Tags ({getTotalSelectedCount()})
        </label>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                {getTotalSelectedCount() > 0
                  ? `${getTotalSelectedCount()} tags selected`
                  : 'Add tags...'}
              </span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-[400px] p-0 flex flex-col">
            <SheetHeader className="p-6 pb-4 flex-shrink-0">
              <SheetTitle>Tags from SOLO Plan</SheetTitle>
              <SheetDescription>
                Select activities, assessments, and resources to tag this entry
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 min-h-0">
              <TagSelectorContent />
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Selected tags preview */}
        {getTotalSelectedCount() > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedTags.activities?.map((tag, index) => (
              <span key={index} className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                {getTagDisplayName(tag, 'activities')}
                <button
                  onClick={() => toggleTag('activities', tag)}
                  className="ml-1 hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedTags.assessments?.map((tag, index) => (
              <span key={index} className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                {getTagDisplayName(tag, 'assessments')}
                <button
                  onClick={() => toggleTag('assessments', tag)}
                  className="ml-1 hover:text-green-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedTags.resources?.map((tag, index) => (
              <span key={index} className="inline-flex items-center px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                {getTagDisplayName(tag, 'resources')}
                <button
                  onClick={() => toggleTag('resources', tag)}
                  className="ml-1 hover:text-purple-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Full view
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Tags from SOLO Plan
        </label>
        {getTotalSelectedCount() > 0 && (
          <span className="text-sm text-gray-500">
            {getTotalSelectedCount()} selected
          </span>
        )}
      </div>

      {/* AI Suggestions Banner */}
      {(suggestions.activities?.length > 0 || 
        suggestions.assessments?.length > 0 || 
        suggestions.resources?.length > 0) && (
        <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
          <div className="flex items-center mb-2">
            <Sparkles className="w-4 h-4 text-purple-600 mr-2" />
            <span className="text-sm font-medium text-purple-900">
              AI-Suggested Tags Based on Content
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.activities?.slice(0, 2).map((tag, index) => (
              <button
                key={`activity-${index}`}
                onClick={() => toggleTag('activities', tag)}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
              >
                <Plus className="w-3 h-3 mr-1" />
                {getTagDisplayName(tag, 'activities')}
              </button>
            ))}
            {suggestions.assessments?.slice(0, 2).map((tag, index) => (
              <button
                key={`assessment-${index}`}
                onClick={() => toggleTag('assessments', tag)}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-700 hover:bg-green-200"
              >
                <Plus className="w-3 h-3 mr-1" />
                {getTagDisplayName(tag, 'assessments')}
              </button>
            ))}
            {suggestions.resources?.slice(0, 2).map((tag, index) => (
              <button
                key={`resource-${index}`}
                onClick={() => toggleTag('resources', tag)}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700 hover:bg-purple-200"
              >
                <Plus className="w-3 h-3 mr-1" />
                {getTagDisplayName(tag, 'resources')}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border border-gray-200 rounded-lg">
        <TagSelectorContent />
      </div>

      {/* Info box */}
      <div className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg">
        <Info className="w-4 h-4 text-gray-400 mt-0.5" />
        <p className="text-xs text-gray-600">
          Tag your portfolio entries to show how they connect to your SOLO Education Plan. 
          This helps demonstrate coverage of learning outcomes to your facilitator.
        </p>
      </div>
    </div>
  );
};

export default PortfolioTagSelector;
