import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { ChevronDown, ChevronRight, Code, Palette, Zap, X } from 'lucide-react';

// Import template collections
import * as FullLessons from './fullLessons';
import * as Components from './components';

const TemplateSelector = ({ onSelect, onClose, compact = false }) => {
  const [expandedCategory, setExpandedCategory] = useState('fullLessons');
  
  const templateCategories = [
    {
      id: 'fullLessons',
      title: '📋 Full Lesson Templates',
      description: 'Complete lesson structures with content and assessments',
      icon: <Code className="h-4 w-4" />,
      templates: [
        {
          id: 'physics',
          name: 'Physics Lesson',
          description: 'Theory + examples + AI questions (like momentum lesson)',
          icon: '⚛️',
          code: FullLessons.physicsTemplate
        },
        {
          id: 'financial',
          name: 'Financial Literacy',
          description: 'Ethics + applications + practice sections',
          icon: '💰',
          code: FullLessons.financialTemplate
        },
        {
          id: 'interactive',
          name: 'Interactive Demo',
          description: 'Animations + simulations + state management',
          icon: '🎮',
          code: FullLessons.interactiveTemplate
        },
        {
          id: 'assessment',
          name: 'Assessment Heavy',
          description: 'Multiple AI questions and practice sections',
          icon: '📝',
          code: FullLessons.assessmentTemplate
        }
      ]
    },
    {
      id: 'components',
      title: '🧩 Component Templates',
      description: 'Individual components you can combine',
      icon: <Palette className="h-4 w-4" />,
      templates: [
        {
          id: 'header',
          name: 'Lesson Header',
          description: 'Title, subtitle, and badges',
          icon: '📰',
          code: Components.headerTemplate
        },
        {
          id: 'objectives',
          name: 'Learning Objectives',
          description: 'Checklist-style objectives card',
          icon: '🎯',
          code: Components.objectivesTemplate
        },
        {
          id: 'theory',
          name: 'Theory Card',
          description: 'Content card with formula box',
          icon: '📚',
          code: Components.theoryTemplate
        },
        {
          id: 'examples',
          name: 'Examples Grid',
          description: '2-column examples layout',
          icon: '💡',
          code: Components.examplesTemplate
        },
        {
          id: 'interactive',
          name: 'Interactive Counter',
          description: 'useState example with buttons',
          icon: '🔢',
          code: Components.interactiveTemplate
        },
        {
          id: 'assessment',
          name: 'AI Question Slot',
          description: 'AI assessment component placeholder',
          icon: '🤖',
          code: Components.assessmentTemplate
        }
      ]
    },
    {
      id: 'future',
      title: '🎯 Assessment Ready',
      description: 'Templates with modular question integration (coming soon)',
      icon: <Zap className="h-4 w-4" />,
      disabled: true,
      templates: [
        {
          id: 'modular',
          name: 'Modular Quiz',
          description: 'Dynamic question bank integration',
          icon: '❓',
          disabled: true
        },
        {
          id: 'adaptive',
          name: 'Adaptive Assessment',
          description: 'AI-powered difficulty adjustment',
          icon: '🧠',
          disabled: true
        }
      ]
    }
  ];

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleTemplateSelect = (template) => {
    if (template.disabled) return;
    onSelect?.(template.code);
  };

  // Compact mobile view
  if (compact) {
    return (
      <div className="space-y-2">
        {templateCategories.map(category => (
          <div key={category.id}>
            <Button
              variant="ghost"
              className="w-full justify-between h-8 text-sm"
              onClick={() => toggleCategory(category.id)}
              disabled={category.disabled}
            >
              <span className="flex items-center gap-2">
                {category.icon}
                {category.title}
              </span>
              {expandedCategory === category.id ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
            
            {expandedCategory === category.id && (
              <div className="ml-4 mt-1 space-y-1">
                {category.templates.map(template => (
                  <Button
                    key={template.id}
                    variant="ghost"
                    className="w-full justify-start h-7 text-xs"
                    onClick={() => handleTemplateSelect(template)}
                    disabled={template.disabled}
                  >
                    <span className="mr-2">{template.icon}</span>
                    {template.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Full desktop view
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Template Library</h3>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="grid md:grid-cols-3 gap-4">
        {templateCategories.map(category => (
          <Card key={category.id} className={category.disabled ? 'opacity-50' : ''}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                {category.icon}
                {category.title}
                {category.disabled && <Badge variant="outline" className="text-xs">Soon</Badge>}
              </CardTitle>
              <p className="text-xs text-gray-600">{category.description}</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {category.templates.map(template => (
                  <Button
                    key={template.id}
                    variant="outline"
                    className="w-full justify-start h-auto p-3 text-left"
                    onClick={() => handleTemplateSelect(template)}
                    disabled={template.disabled || category.disabled}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <span className="text-lg">{template.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{template.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        💡 Tip: Click a template to insert it into the editor. You can then customize it for your lesson.
      </div>
    </div>
  );
};

export default TemplateSelector;