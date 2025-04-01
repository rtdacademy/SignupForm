import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, set } from 'firebase/database';
import { toast } from 'sonner';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle
} from '../components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { 
  getSchoolYearOptions, 
  STUDENT_TYPE_OPTIONS, 
  getStudentTypeInfo,
  TERM_OPTIONS,
  getTermInfo
} from '../config/DropdownOptions';
import { 
  Loader2, 
  Plus, 
  Trash2, 
  Save, 
  AlertTriangle,
  Calendar,
  CalendarClock,
  Copy,
  CheckCircle
} from 'lucide-react';

// Enhanced Quill editor modules and formats configuration - removed indent options
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    // Removed indent buttons
    [{ 'color': [] }, { 'background': [] }],
    ['link'],
    ['clean']
  ],
};

// Define custom handlers to support different ordered list formats (1, a, A, i, I)
const createQuillModules = (id) => {
  return {
    ...quillModules,
    clipboard: {
      matchVisual: false,
    },
    keyboard: {
      bindings: {
        // Add custom keyboard shortcuts if needed
      }
    }
  };
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', // Removed indent from formats
  'script',
  'color', 'background',
  'link'
];

function RegistrationSettings() {
  // State for selection
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedStudentType, setSelectedStudentType] = useState('');
  
  // State for form data
  const [formConfig, setFormConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // State for copy functionality
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [copySourceType, setCopySourceType] = useState('');
  const [isCopying, setIsCopying] = useState(false);
  
  // School year options
  const schoolYearOptions = getSchoolYearOptions();
  
  // Initialize with default year when component mounts
  useEffect(() => {
    const defaultYear = schoolYearOptions.find(opt => opt.isDefault)?.value || schoolYearOptions[0]?.value;
    if (defaultYear && !selectedYear) {
      setSelectedYear(defaultYear);
    }
  }, [schoolYearOptions, selectedYear]);
  
  // Quill list format customization
  useEffect(() => {
    // This effect runs client-side only
    if (typeof window !== 'undefined') {
      // Ensure Quill is available in browser environment
      if (window.Quill) {
        // Get the Quill constructor
        const Quill = window.Quill;
        
        // Get the List class from Quill's registry
        const ListClass = Quill.import('formats/list');
        
        // Override the List class's createElement method to support more list types
        const originalCreateElement = ListClass.prototype.createElement;
        
        ListClass.prototype.createElement = function(value) {
          const element = originalCreateElement.call(this, value);
          
          // Check if we need to set a special list style
          if (value === 'ordered') {
            // Default is numerical (1, 2, 3...)
            element.setAttribute('type', '1');
          }
          
          return element;
        };
        
        // Register the updated List class
        Quill.register('formats/list', ListClass, true);
      }
    }
  }, []);
  
  // Fetch configuration when year or student type changes
  useEffect(() => {
    if (!selectedYear || !selectedStudentType) return;
    
    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const formattedYear = selectedYear.replace('/', '_');
        const formattedType = selectedStudentType.replace(/\s+/g, '-');
        
        const db = getDatabase();
        const configRef = ref(db, `registrationSettings/${formattedYear}/${formattedType}`);
        const snapshot = await get(configRef);
        
        if (snapshot.exists()) {
          const existingConfig = snapshot.val();
          
          // Check if we need to add term to existing time sections
          if (existingConfig.timeSections) {
            existingConfig.timeSections = existingConfig.timeSections.map(section => {
              const updatedSection = { ...section };
              
              // Set default term if missing
              if (!updatedSection.term) {
                let defaultTerm = 'Full Year';
                
                if (selectedStudentType === 'Non-Primary') {
                  defaultTerm = 'Term 1';
                } else if (selectedStudentType === 'Summer School') {
                  defaultTerm = 'Summer';
                } else if (selectedStudentType === 'Home Education') {
                  defaultTerm = 'Full Year';
                }
                
                updatedSection.term = defaultTerm;
              }
              
              // Set startFromToday flag if missing
              if (updatedSection.startFromToday === undefined) {
                // Check if startBegins is 1900-01-01, which would indicate "start from today"
                if (updatedSection.startBegins === '1900-01-01') {
                  updatedSection.startFromToday = true;
                } else {
                  updatedSection.startFromToday = false;
                }
              }
              
              return updatedSection;
            });
          }
          
          setFormConfig(existingConfig);
        } else {
          // Get default term for student type
          let defaultTerm = 'Full Year';
          
          if (selectedStudentType === 'Non-Primary') {
            defaultTerm = 'Term 1';
          } else if (selectedStudentType === 'Summer School') {
            defaultTerm = 'Summer';
          } else if (selectedStudentType === 'Home Education') {
            defaultTerm = 'Full Year';
          }
          
          // Initialize with default structure if no config exists
          setFormConfig({
            generalMessage: '',
            allowNextYearRegistration: false,
            timeSections: [
              {
                id: 'default',
                title: 'Default Registration Period',
                startBegins: '',
                startEnds: '',
                completionBegins: '',
                completionEnds: '',
                message: '<p>Please select a start and completion date within the registration period.</p>',
                isForNextYear: false,
                isActive: true,
                term: defaultTerm,
                startFromToday: false
              }
            ]
          });
        }
      } catch (error) {
        console.error('Error fetching registration config:', error);
        toast.error('Failed to load registration settings');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConfig();
  }, [selectedYear, selectedStudentType]);

  const sanitizeHtml = (html) => {
    if (!html) return '';
    
    try {
      // First, explicitly check for common unclosed tags in Quill output
      let fixedHtml = html;
      
      // Check for unclosed list tags (common issue with Quill)
      if ((fixedHtml.includes('<ol') && !fixedHtml.includes('</ol>')) || 
          (fixedHtml.includes('<ul') && !fixedHtml.includes('</ul>'))) {
        
        // Use DOMParser for more robust parsing
        const parser = new DOMParser();
        const doc = parser.parseFromString(fixedHtml, 'text/html');
        
        // Get the normalized HTML from the body
        fixedHtml = doc.body.innerHTML;
      } else {
        // For simpler cases, use the div approach which is faster
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = fixedHtml;
        fixedHtml = tempDiv.innerHTML;
      }
      
      return fixedHtml;
    } catch (error) {
      console.error('Error sanitizing HTML:', error);
      // Return the original HTML if there's an error during sanitization
      return html;
    }
  };
  
  // Save configuration to Firebase
  const saveConfig = async () => {
    if (!selectedYear || !selectedStudentType || !formConfig) return;
    
    setIsSaving(true);
    try {
      // Create a sanitized copy of the form config
      const sanitizedConfig = {
        ...formConfig,
        generalMessage: sanitizeHtml(formConfig.generalMessage || ''),
        timeSections: formConfig.timeSections.map(section => ({
          ...section,
          message: sanitizeHtml(section.message || '')
        }))
      };
      
      const formattedYear = selectedYear.replace('/', '_');
      const formattedType = selectedStudentType.replace(/\s+/g, '-');
      
      const db = getDatabase();
      const configRef = ref(db, `registrationSettings/${formattedYear}/${formattedType}`);
      await set(configRef, sanitizedConfig);
      
      // Update the local form config with the sanitized version
      setFormConfig(sanitizedConfig);
      
      toast.success('Registration settings saved successfully');
    } catch (error) {
      console.error('Error saving registration config:', error);
      toast.error('Failed to save registration settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Add a new time section
  const addTimeSection = (isForNextYear = false) => {
    // Set default term based on student type
    let defaultTerm = 'Full Year';
    
    if (selectedStudentType === 'Non-Primary') {
      defaultTerm = 'Term 1'; // Non-primary defaults to Term 1
    } else if (selectedStudentType === 'Summer School') {
      defaultTerm = 'Summer'; // Summer School defaults to Summer
    } else if (selectedStudentType === 'Home Education') {
      defaultTerm = 'Full Year'; // Home Education defaults to Full Year
    } else if (selectedStudentType === 'Adult Student' || selectedStudentType === 'International Student') {
      defaultTerm = 'Full Year'; // Adult/International defaults to Full Year
    }
    
    const newSection = {
      id: `section_${Date.now()}`,
      title: `New ${isForNextYear ? 'Next Year' : 'Current Year'} Registration Period`,
      startBegins: '',
      startEnds: '',
      completionBegins: '',
      completionEnds: '',
      message: '<p>Please select a start and completion date within this registration period.</p>',
      isForNextYear: isForNextYear,
      isActive: true,
      term: defaultTerm,
      startFromToday: false
    };
    
    setFormConfig(prev => ({
      ...prev,
      timeSections: [...prev.timeSections, newSection]
    }));
  };
  
  // Delete a time section
  const deleteTimeSection = (sectionId) => {
    // Check if there's at least one section for current year and one for next year (if enabled)
    const currentSections = formConfig.timeSections.filter(s => !s.isForNextYear);
    const nextYearSections = formConfig.timeSections.filter(s => s.isForNextYear);
    
    const sectionToDelete = formConfig.timeSections.find(s => s.id === sectionId);
    
    if (sectionToDelete) {
      if (!sectionToDelete.isForNextYear && currentSections.length <= 1) {
        toast.error('You must have at least one current year registration period');
        return;
      }
      
      if (sectionToDelete.isForNextYear && nextYearSections.length <= 1 && formConfig.allowNextYearRegistration) {
        toast.error('You must have at least one next year registration period when next year registration is enabled');
        return;
      }
    }
    
    setFormConfig(prev => ({
      ...prev,
      timeSections: prev.timeSections.filter(section => section.id !== sectionId)
    }));
  };
  
  // Update a time section field
  const updateTimeSection = (sectionId, field, value) => {
    setFormConfig(prev => ({
      ...prev,
      timeSections: prev.timeSections.map(section => 
        section.id === sectionId 
          ? { ...section, [field]: value } 
          : section
      )
    }));
  };
  
  // Update general form config fields
  const updateFormConfig = (field, value) => {
    setFormConfig(prev => ({
      ...prev,
      [field]: value
    }));
    
    // If enabling next year registration and there's no next year section, add one
    if (field === 'allowNextYearRegistration' && value === true) {
      const hasNextYearSection = formConfig.timeSections.some(section => section.isForNextYear);
      if (!hasNextYearSection) {
        addTimeSection(true);
      }
    }
  };
  
  // Check if dates in a time section are valid
  const isTimeSectionValid = (section) => {
    // Skip startBegins validation if startFromToday is true
    if (section.startFromToday) {
      if (!section.startEnds || !section.completionBegins || !section.completionEnds) {
        return false;
      }
      
      const startEnds = new Date(section.startEnds);
      const completionBegins = new Date(section.completionBegins);
      const completionEnds = new Date(section.completionEnds);
      
      return (
        completionBegins <= completionEnds
      );
    } else {
      if (!section.startBegins || !section.startEnds || !section.completionBegins || !section.completionEnds) {
        return false;
      }
      
      const startBegins = new Date(section.startBegins);
      const startEnds = new Date(section.startEnds);
      const completionBegins = new Date(section.completionBegins);
      const completionEnds = new Date(section.completionEnds);
      
      return (
        startBegins <= startEnds &&
        startBegins <= completionBegins &&
        completionBegins <= completionEnds
      );
    }
  };
  
  // Get color for validity visual indicator
  const getSectionStatusColor = (section) => {
    if (section.startFromToday) {
      // For sections with "start from today" enabled, we only need to check other date fields
      if (!section.startEnds || !section.completionBegins || !section.completionEnds) {
        return 'bg-gray-300';
      }
    } else {
      // For normal sections, check all date fields
      if (!section.startBegins || !section.startEnds || !section.completionBegins || !section.completionEnds) {
        return 'bg-gray-300';
      }
    }
    
    return isTimeSectionValid(section) ? 'bg-green-500' : 'bg-red-500';
  };
  
  // Filter time sections by year
  const getCurrentYearSections = () => {
    return formConfig?.timeSections.filter(section => !section.isForNextYear) || [];
  };
  
  const getNextYearSections = () => {
    return formConfig?.timeSections.filter(section => section.isForNextYear) || [];
  };
  
  // Copy settings from another student type
  const handleCopySettings = async () => {
    if (!selectedYear || !selectedStudentType || !copySourceType) return;
    
    setIsCopying(true);
    try {
      const formattedYear = selectedYear.replace('/', '_');
      const formattedSourceType = copySourceType.replace(/\s+/g, '-');
      
      const db = getDatabase();
      const sourceConfigRef = ref(db, `registrationSettings/${formattedYear}/${formattedSourceType}`);
      const snapshot = await get(sourceConfigRef);
      
      if (snapshot.exists()) {
        // Copy the configuration
        setFormConfig(snapshot.val());
        
        toast.success(`Settings copied from ${copySourceType}`);
        
        // Close the dialog
        setIsCopyDialogOpen(false);
      } else {
        toast.error(`No settings found for ${copySourceType}`);
      }
    } catch (error) {
      console.error('Error copying registration config:', error);
      toast.error('Failed to copy registration settings');
    } finally {
      setIsCopying(false);
    }
  };
  
  // Helper to get Quill modules for a specific editor
  const getQuillModules = (id) => {
    return createQuillModules(id);
  };
  
  // The component UI with fixed header and scrollable content
  return (
    <div className="h-full flex flex-col" style={{ height: '100%', position: 'relative' }}>
      {/* Fixed position header at the top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <div className="p-4 mb-2">
          <Card className="mx-auto max-w-5xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Registration Settings</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {formConfig && selectedStudentType 
                    ? `Configure registration form settings for ${selectedStudentType} students (${selectedYear})`
                    : 'Configure registration form settings for different student types and school years'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="year-select">School Year:</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear} id="year-select">
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select school year" />
                    </SelectTrigger>
                    <SelectContent>
                      {schoolYearOptions.map(option => (
                        <SelectItem 
                          key={option.value} 
                          value={option.value}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: option.color }}></div>
                            <span>{option.value}{option.isDefault ? ' (Current)' : ''}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Label htmlFor="type-select">Student Type:</Label>
                  <Select value={selectedStudentType} onValueChange={setSelectedStudentType} id="type-select">
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select student type" />
                    </SelectTrigger>
                    <SelectContent>
                      {STUDENT_TYPE_OPTIONS.map(option => {
                        const Icon = option.icon;
                        return (
                          <SelectItem 
                            key={option.value} 
                            value={option.value}
                          >
                            <div className="flex items-center gap-2">
                              {Icon && <Icon className="w-4 h-4" style={{ color: option.color }} />}
                              <span>{option.value}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedStudentType && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsCopyDialogOpen(true)}
                    className="ml-2"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy From...
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Scrollable content with padding top to account for the fixed header */}
      <div 
        className="overflow-y-auto w-full" 
        style={{ 
          height: '100%', 
          paddingTop: '110px', 
          paddingLeft: '16px',
          paddingRight: '16px',
          paddingBottom: '32px'
        }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600" />
              <p className="mt-4 text-gray-600">Loading registration settings...</p>
            </div>
          </div>
        ) : !formConfig || !selectedStudentType ? (
          <Card className="max-w-3xl mx-auto">
            <CardContent className="space-y-6 py-6">
              <p className="text-center text-gray-500 my-8">
                Please select a school year and student type to configure registration settings
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="mx-auto max-w-5xl mb-6">
            <CardContent className="pt-6 space-y-6">
              {/* General Settings Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-medium border-b pb-2">General Settings</h2>
                
                <div className="space-y-2">
                  <Label htmlFor="general-message">General Message</Label>
                  <div className="quill-container">
                    <ReactQuill
                      id="general-message"
                      value={formConfig.generalMessage || ''}
                      onChange={(content) => updateFormConfig('generalMessage', content)}
                      modules={getQuillModules('general-message')}
                      formats={quillFormats}
                      theme="snow"
                      placeholder="Enter a message to display at the top of the registration form"
                      style={{ minHeight: '150px', marginBottom: '40px' }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-10 mb-2">
                    <p>This message will appear at the top of the registration form for this student type</p>
                  </div>
                </div>
              </div>
              
              {/* Current Year Registration Periods */}
              <div className="space-y-4 mt-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium border-b pb-2">Current Year Registration Periods</h2>
                  <Button 
                    onClick={() => addTimeSection(false)} 
                    variant="outline" 
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Current Year Period
                  </Button>
                </div>
                
                {getCurrentYearSections().length === 0 ? (
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-sm text-amber-700">
                      No current year registration periods defined. Please add at least one.
                    </AlertDescription>
                  </Alert>
                ) : (
                  getCurrentYearSections().map((section, index) => (
                    <Card key={section.id} className="border-l-4" style={{ borderLeftColor: getStudentTypeInfo(selectedStudentType).color }}>
                      <CardHeader className="flex flex-row items-center justify-between p-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getSectionStatusColor(section)}`}></div>
                          <CardTitle className="text-base font-medium">{section.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => deleteTimeSection(section.id)}
                          >
                            <Trash2 className="w-4 h-4 text-gray-500" />
                          </Button>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-4 pt-0">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`section-title-${section.id}`}>Section Title</Label>
                            <Input 
                              id={`section-title-${section.id}`}
                              value={section.title} 
                              onChange={(e) => updateTimeSection(section.id, 'title', e.target.value)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Switch 
                                id={`active-${section.id}`}
                                checked={section.isActive !== false} 
                                onCheckedChange={(checked) => updateTimeSection(section.id, 'isActive', checked)}
                              />
                              <Label htmlFor={`active-${section.id}`} className="font-medium">
                                Active
                              </Label>
                            </div>
                            <div className="text-sm text-gray-500">
                              {section.isActive !== false ? 'This period is active and visible to students' : 'This period is inactive and hidden from students'}
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <Label htmlFor={`term-${section.id}`} className="block text-sm font-medium mb-2">Term</Label>
                            <Select 
                              value={section.term || 'Full Year'} 
                              onValueChange={(value) => updateTimeSection(section.id, 'term', value)} 
                              id={`term-${section.id}`}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select term" />
                              </SelectTrigger>
                              <SelectContent>
                                {TERM_OPTIONS
                                  .filter(option => {
                                    // Filter options based on student type
                                    if (selectedStudentType === 'Non-Primary' || selectedStudentType === 'Home Education') {
                                      // Only Term 1, Term 2 for Non-Primary/Home Ed
                                      return option.value === 'Term 1' || option.value === 'Term 2';
                                    } else if (selectedStudentType === 'Summer School') {
                                      // Only Summer for Summer School
                                      return option.value === 'Summer';
                                    } else {
                                      // All options for Adult/International Student
                                      return true;
                                    }
                                  })
                                  .map(option => {
                                    const Icon = option.icon;
                                    return (
                                      <SelectItem 
                                        key={option.value} 
                                        value={option.value}
                                      >
                                        <div className="flex items-center gap-2">
                                          {Icon && <Icon className="w-4 h-4" style={{ color: option.color }} />}
                                          <span>{option.label}</span>
                                        </div>
                                      </SelectItem>
                                    );
                                  })
                                }
                              </SelectContent>
                            </Select>
                            <div className="text-xs text-gray-500 mt-1">
                              The term will be displayed to students when selecting this registration period
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Label htmlFor={`start-begins-toggle-${section.id}`}>Start Date Begins</Label>
                                <div className="flex items-center gap-2">
                                  <Switch 
                                    id={`start-begins-toggle-${section.id}`}
                                    checked={!section.startFromToday} 
                                    onCheckedChange={(checked) => {
                                      if (!checked) {
                                        // If toggled off, set to far past date (1900-01-01)
                                        updateTimeSection(section.id, 'startBegins', '1900-01-01');
                                        updateTimeSection(section.id, 'startFromToday', true);
                                      } else {
                                        // If toggled on, clear the far past date
                                        updateTimeSection(section.id, 'startBegins', '');
                                        updateTimeSection(section.id, 'startFromToday', false);
                                      }
                                    }}
                                  />
                                  <span className="text-xs text-gray-500">
                                    {section.startFromToday ? "Always starts today" : "Specific date"}
                                  </span>
                                </div>
                              </div>
                              
                              {!section.startFromToday && (
                                <div className="relative">
                                  <Input 
                                    id={`start-begins-${section.id}`}
                                    type="date" 
                                    value={section.startBegins || ''} 
                                    onChange={(e) => updateTimeSection(section.id, 'startBegins', e.target.value)}
                                    className="w-full pr-10"
                                  />
                                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                </div>
                              )}
                              
                              {section.startFromToday && (
                                <Alert className="bg-blue-50 border-blue-200 py-2">
                                  <CalendarClock className="h-4 w-4 text-blue-600" />
                                  <AlertDescription className="text-xs text-blue-700">
                                    Registration will always start from today's date
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`start-ends-${section.id}`}>Start Date Ends</Label>
                              <div className="relative">
                                <Input 
                                  id={`start-ends-${section.id}`}
                                  type="date" 
                                  value={section.startEnds || ''} 
                                  onChange={(e) => updateTimeSection(section.id, 'startEnds', e.target.value)}
                                  className="w-full pr-10"
                                />
                                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`completion-begins-${section.id}`}>Completion Date Begins</Label>
                              <div className="relative">
                                <Input 
                                  id={`completion-begins-${section.id}`}
                                  type="date" 
                                  value={section.completionBegins || ''} 
                                  onChange={(e) => updateTimeSection(section.id, 'completionBegins', e.target.value)}
                                  className="w-full pr-10"
                                />
                                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`completion-ends-${section.id}`}>Completion Date Ends</Label>
                              <div className="relative">
                                <Input 
                                  id={`completion-ends-${section.id}`}
                                  type="date" 
                                  value={section.completionEnds || ''} 
                                  onChange={(e) => updateTimeSection(section.id, 'completionEnds', e.target.value)}
                                  className="w-full pr-10"
                                />
                                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`section-message-${section.id}`}>Section Message</Label>
                            <div className="quill-container">
                              <ReactQuill
                                id={`section-message-${section.id}`}
                                value={section.message || ''}
                                onChange={(content) => updateTimeSection(section.id, 'message', content)}
                                modules={getQuillModules(`section-message-${section.id}`)}
                                formats={quillFormats}
                                theme="snow"
                                style={{ minHeight: '120px', marginBottom: '40px' }}
                              />
                            </div>
                            <div className="text-xs text-gray-500 mt-10 mb-2">
                              <p>Message displayed to students when this registration period is active</p>
                            </div>
                          </div>
                          
                          {!isTimeSectionValid(section) && section.startBegins && section.startEnds && 
                           section.completionBegins && section.completionEnds && (
                            <Alert className="bg-red-50 border-red-200">
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                              <AlertDescription className="text-sm text-red-700">
                                Invalid date configuration. Please ensure start date begins before start date ends,
                                and completion date begins before completion date ends.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
              
              {/* Next Year Registration Section */}
              <div className="space-y-4 mt-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium border-b pb-2">Next Year Registration</h2>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="allow-next-year" className="sr-only">Allow Registration for Next Year</Label>
                    <Switch 
                      id="allow-next-year"
                      checked={formConfig.allowNextYearRegistration || false} 
                      onCheckedChange={(checked) => updateFormConfig('allowNextYearRegistration', checked)}
                    />
                    <span className="text-sm font-medium">
                      {formConfig.allowNextYearRegistration ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
                
                {formConfig.allowNextYearRegistration && (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-md font-medium">Next Year Registration Periods</h3>
                      <Button 
                        onClick={() => addTimeSection(true)} 
                        variant="outline" 
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Next Year Period
                      </Button>
                    </div>
                    
                    {getNextYearSections().length === 0 ? (
                      <Alert className="bg-amber-50 border-amber-200">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-sm text-amber-700">
                          No next year registration periods defined. Please add at least one.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      getNextYearSections().map((section, index) => (
                        <Card key={section.id} className="border-l-4 bg-blue-50" style={{ borderLeftColor: '#4f46e5' }}>
                          <CardHeader className="flex flex-row items-center justify-between p-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getSectionStatusColor(section)}`}></div>
                              <CardTitle className="text-base font-medium">
                                <span className="flex items-center gap-1">
                                  <span className="text-blue-600">[Next Year]</span> {section.title}
                                </span>
                              </CardTitle>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => deleteTimeSection(section.id)}
                              >
                                <Trash2 className="w-4 h-4 text-gray-500" />
                              </Button>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="p-4 pt-0">
                            <div className="grid grid-cols-1 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`section-title-${section.id}`}>Section Title</Label>
                                <Input 
                                  id={`section-title-${section.id}`}
                                  value={section.title} 
                                  onChange={(e) => updateTimeSection(section.id, 'title', e.target.value)}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                  <Switch 
                                    id={`active-${section.id}`}
                                    checked={section.isActive !== false} 
                                    onCheckedChange={(checked) => updateTimeSection(section.id, 'isActive', checked)}
                                  />
                                  <Label htmlFor={`active-${section.id}`} className="font-medium">
                                    Active
                                  </Label>
                                </div>
                                <div className="text-sm text-gray-500">
                                  {section.isActive !== false ? 'This period is active and visible to students' : 'This period is inactive and hidden from students'}
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <Label htmlFor={`term-${section.id}`} className="block text-sm font-medium mb-2">Term</Label>
                                <Select 
                                  value={section.term || 'Full Year'} 
                                  onValueChange={(value) => updateTimeSection(section.id, 'term', value)} 
                                  id={`term-${section.id}`}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select term" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {TERM_OPTIONS
                                      .filter(option => {
                                        // Filter options based on student type
                                        if (selectedStudentType === 'Non-Primary' || selectedStudentType === 'Home Education') {
                                          // Only Term 1, Term 2 for Non-Primary/Home Ed
                                          return option.value === 'Term 1' || option.value === 'Term 2';
                                        } else if (selectedStudentType === 'Summer School') {
                                          // Only Summer for Summer School
                                          return option.value === 'Summer';
                                        } else {
                                          // All options for Adult/International Student
                                          return true;
                                        }
                                      })
                                      .map(option => {
                                        const Icon = option.icon;
                                        return (
                                          <SelectItem 
                                            key={option.value} 
                                            value={option.value}
                                          >
                                            <div className="flex items-center gap-2">
                                              {Icon && <Icon className="w-4 h-4" style={{ color: option.color }} />}
                                              <span>{option.label}</span>
                                            </div>
                                          </SelectItem>
                                        );
                                      })
                                    }
                                  </SelectContent>
                                </Select>
                                <div className="text-xs text-gray-500 mt-1">
                                  The term will be displayed to students when selecting this registration period
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor={`start-begins-toggle-${section.id}`}>Start Date Begins</Label>
                                    <div className="flex items-center gap-2">
                                      <Switch 
                                        id={`start-begins-toggle-${section.id}`}
                                        checked={!section.startFromToday} 
                                        onCheckedChange={(checked) => {
                                          if (!checked) {
                                            // If toggled off, set to far past date (1900-01-01)
                                            updateTimeSection(section.id, 'startBegins', '1900-01-01');
                                            updateTimeSection(section.id, 'startFromToday', true);
                                          } else {
                                            // If toggled on, clear the far past date
                                            updateTimeSection(section.id, 'startBegins', '');
                                            updateTimeSection(section.id, 'startFromToday', false);
                                          }
                                        }}
                                      />
                                      <span className="text-xs text-gray-500">
                                        {section.startFromToday ? "Always starts today" : "Specific date"}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {!section.startFromToday && (
                                    <div className="relative">
                                      <Input 
                                        id={`start-begins-${section.id}`}
                                        type="date" 
                                        value={section.startBegins || ''} 
                                        onChange={(e) => updateTimeSection(section.id, 'startBegins', e.target.value)}
                                        className="w-full pr-10"
                                      />
                                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    </div>
                                  )}
                                  
                                  {section.startFromToday && (
                                    <Alert className="bg-blue-50 border-blue-200 py-2">
                                      <CalendarClock className="h-4 w-4 text-blue-600" />
                                      <AlertDescription className="text-xs text-blue-700">
                                        Registration will always start from today's date
                                      </AlertDescription>
                                    </Alert>
                                  )}
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor={`start-ends-${section.id}`}>Start Date Ends</Label>
                                  <div className="relative">
                                    <Input 
                                      id={`start-ends-${section.id}`}
                                      type="date" 
                                      value={section.startEnds || ''} 
                                      onChange={(e) => updateTimeSection(section.id, 'startEnds', e.target.value)}
                                      className="w-full pr-10"
                                    />
                                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor={`completion-begins-${section.id}`}>Completion Date Begins</Label>
                                  <div className="relative">
                                    <Input 
                                      id={`completion-begins-${section.id}`}
                                      type="date" 
                                      value={section.completionBegins || ''} 
                                      onChange={(e) => updateTimeSection(section.id, 'completionBegins', e.target.value)}
                                      className="w-full pr-10"
                                    />
                                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor={`completion-ends-${section.id}`}>Completion Date Ends</Label>
                                  <div className="relative">
                                    <Input 
                                      id={`completion-ends-${section.id}`}
                                      type="date" 
                                      value={section.completionEnds || ''} 
                                      onChange={(e) => updateTimeSection(section.id, 'completionEnds', e.target.value)}
                                      className="w-full pr-10"
                                    />
                                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`section-message-${section.id}`}>Section Message</Label>
                                <div className="quill-container">
                                  <ReactQuill
                                    id={`section-message-${section.id}`}
                                    value={section.message || ''}
                                    onChange={(content) => updateTimeSection(section.id, 'message', content)}
                                    modules={getQuillModules(`section-message-${section.id}`)}
                                    formats={quillFormats}
                                    theme="snow"
                                    style={{ minHeight: '120px', marginBottom: '40px' }}
                                  />
                                </div>
                                <div className="text-xs text-gray-500 mt-10 mb-2">
                                  <p>Message displayed to students when this next year registration period is active</p>
                                </div>
                              </div>
                              
                              {!isTimeSectionValid(section) && section.startBegins && section.startEnds && 
                               section.completionBegins && section.completionEnds && (
                                <Alert className="bg-red-50 border-red-200">
                                  <AlertTriangle className="h-4 w-4 text-red-600" />
                                  <AlertDescription className="text-sm text-red-700">
                                    Invalid date configuration. Please ensure start date begins before start date ends,
                                    and completion date begins before completion date ends.
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </>
                )}
              </div>
              
              {/* Save Button */}
              <div className="flex justify-center my-12 pb-12">
                <Button 
                  onClick={saveConfig} 
                  disabled={isSaving} 
                  className="px-12 py-6"
                  size="lg"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Copy Settings Dialog */}
      <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Copy Settings from Another Student Type</DialogTitle>
            <DialogDescription>
              Select a student type to copy settings from. This will replace your current settings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="source-type-select">Copy from:</Label>
              <Select 
                value={copySourceType} 
                onValueChange={setCopySourceType}
                id="source-type-select"
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select student type" />
                </SelectTrigger>
                <SelectContent>
                  {STUDENT_TYPE_OPTIONS
                    .filter(option => option.value !== selectedStudentType)
                    .map(option => {
                      const Icon = option.icon;
                      return (
                        <SelectItem 
                          key={option.value} 
                          value={option.value}
                        >
                          <div className="flex items-center gap-2">
                            {Icon && <Icon className="w-4 h-4" style={{ color: option.color }} />}
                            <span>{option.value}</span>
                          </div>
                        </SelectItem>
                      );
                    })
                  }
                </SelectContent>
              </Select>
            </div>
            
            <Alert className="bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm text-amber-700">
                This will replace all current settings for <strong>{selectedStudentType}</strong> students 
                with settings from the selected student type.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCopyDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCopySettings} 
              disabled={!copySourceType || isCopying}
              className="ml-2"
            >
              {isCopying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Copying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Copy Settings
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add CSS for the ReactQuill editor to ensure proper styling */}
      <style jsx global>{`
        .quill-container {
          margin-bottom: 30px;
        }
        
        .ql-container {
          min-height: 100px;
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
        }
        
        .ql-toolbar {
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
          background-color: #f9fafb;
        }
        
        .ql-editor {
          min-height: 100px;
          font-size: 0.875rem;
        }
        
        /* Improved styling for list formatting */
        .ql-editor ol, .ql-editor ul {
          padding-left: 1.5em;
        }
        
        .ql-editor li {
          padding-left: 0.5em;
        }
        
        /* Nested list styling */
        .ql-editor li > ol, .ql-editor li > ul {
          margin-top: 0.25em;
          margin-bottom: 0.25em;
        }
        
        /* Style for different list types */
        .ql-editor ol {
          list-style-type: decimal;
        }
        
        .ql-editor ol ol {
          list-style-type: lower-alpha;
        }
        
        .ql-editor ol ol ol {
          list-style-type: lower-roman;
        }
      `}</style>
    </div>
  );
}

export default RegistrationSettings;