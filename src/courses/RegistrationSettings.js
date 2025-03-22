import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, set } from 'firebase/database';
import { useToast } from '../components/hooks/use-toast';
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
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '../components/ui/accordion';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  getSchoolYearOptions, 
  STUDENT_TYPE_OPTIONS, 
  getStudentTypeInfo 
} from '../config/DropdownOptions';
import { 
  Loader2, 
  Plus, 
  Trash2, 
  Save, 
  Info,
  AlertTriangle
} from 'lucide-react';

function RegistrationSettings() {
  // State for selection
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedStudentType, setSelectedStudentType] = useState('');
  
  // State for form data
  const [formConfig, setFormConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Toast for notifications
  const { toast } = useToast();
  
  // School year options
  const schoolYearOptions = getSchoolYearOptions();
  
  // Initialize with default year when component mounts
  useEffect(() => {
    const defaultYear = schoolYearOptions.find(opt => opt.isDefault)?.value || schoolYearOptions[0]?.value;
    if (defaultYear && !selectedYear) {
      setSelectedYear(defaultYear);
    }
  }, [schoolYearOptions, selectedYear]);
  
  // Fetch configuration when year or student type changes
  useEffect(() => {
    if (!selectedYear || !selectedStudentType) return;
    
    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const formattedYear = selectedYear.replace('/', '_');
        const formattedType = selectedStudentType.replace(/\s+/g, '-');
        
        const db = getDatabase();
        const configRef = ref(db, `studentTypes/formSettings/${formattedYear}/${formattedType}`);
        const snapshot = await get(configRef);
        
        if (snapshot.exists()) {
          setFormConfig(snapshot.val());
        } else {
          // Initialize with default structure if no config exists
          setFormConfig({
            registrationWindows: {
              default: {
                registrationStart: '',
                registrationEnd: '',
                courseStartMin: '',
                courseStartMax: '',
                courseEndMax: '',
                displayName: 'Default Window',
                displayDescription: '',
                active: true
              }
            },
            dateRules: {
              minStartOffset: 2,
              minDuration: 30,
              recommendedDuration: 150,
              dateSelectionHelp: 'We recommend at least 5 months to complete this course'
            },
            ageRules: {
              minAge: selectedStudentType === 'Adult Student' ? 19 : 0,
              maxAge: selectedStudentType === 'Adult Student' ? null : 19,
              calculationDate: getDefaultCalculationDate(),
              displayMessage: getDefaultAgeMessage(selectedStudentType)
            },
            summerRules: {
              allowedInSummer: selectedStudentType === 'Summer School',
              summerNotice: 'Since you selected an end date in July or August, this will be considered a summer school registration.'
            },
            diplomaRules: {
              endDateIsExamDate: true,
              allowAlreadyWrote: true,
              alreadyWroteDefaultDuration: 150
            }
          });
          
          // Add document rules for international students
          if (selectedStudentType === 'International Student') {
            setFormConfig(prev => ({
              ...prev,
              documentRules: {
                required: true,
                requiredDocuments: ['passport', 'additionalID', 'residencyProof'],
                documentMessages: {
                  passport: 'Please upload a copy of your passport',
                  additionalID: 'Please upload additional identification',
                  residencyProof: 'Please upload proof of residency'
                }
              }
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching registration config:', error);
        toast({
          title: 'Error',
          description: 'Failed to load registration settings',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConfig();
  }, [selectedYear, selectedStudentType, toast]);
  
  // Helper function to get default calculation date (September 1 of current year)
  const getDefaultCalculationDate = () => {
    const currentDate = new Date();
    return `${currentDate.getFullYear()}-09-01`;
  };
  
  // Helper function to get default age message based on student type
  const getDefaultAgeMessage = (studentType) => {
    if (studentType === 'Adult Student') {
      return 'Students must be 19 or older as of September 1';
    } else {
      return 'Students must be under 20 years old as of September 1';
    }
  };
  
  // Save configuration to Firebase
  const saveConfig = async () => {
    if (!selectedYear || !selectedStudentType || !formConfig) return;
    
    setIsSaving(true);
    try {
      const formattedYear = selectedYear.replace('/', '_');
      const formattedType = selectedStudentType.replace(/\s+/g, '-');
      
      const db = getDatabase();
      const configRef = ref(db, `studentTypes/formSettings/${formattedYear}/${formattedType}`);
      await set(configRef, formConfig);
      
      toast({
        title: 'Success',
        description: 'Registration settings saved successfully',
      });
    } catch (error) {
      console.error('Error saving registration config:', error);
      toast({
        title: 'Error',
        description: 'Failed to save registration settings',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Add a new registration window
  const addRegistrationWindow = () => {
    const windowId = `window_${Date.now()}`;
    setFormConfig(prev => ({
      ...prev,
      registrationWindows: {
        ...prev.registrationWindows,
        [windowId]: {
          registrationStart: '',
          registrationEnd: '',
          courseStartMin: '',
          courseStartMax: '',
          courseEndMax: '',
          displayName: 'New Window',
          displayDescription: '',
          active: true
        }
      }
    }));
  };
  
  // Delete a registration window
  const deleteRegistrationWindow = (windowId) => {
    if (Object.keys(formConfig.registrationWindows).length <= 1) {
      toast({
        title: 'Error',
        description: 'Cannot delete last registration window',
        variant: 'destructive'
      });
      return;
    }
    
    setFormConfig(prev => {
      const updatedWindows = {...prev.registrationWindows};
      delete updatedWindows[windowId];
      return {
        ...prev,
        registrationWindows: updatedWindows
      };
    });
  };
  
  // Update registration window field
  const updateWindowField = (windowId, field, value) => {
    setFormConfig(prev => ({
      ...prev,
      registrationWindows: {
        ...prev.registrationWindows,
        [windowId]: {
          ...prev.registrationWindows[windowId],
          [field]: value
        }
      }
    }));
  };
  
  // Update rules field
  const updateRulesField = (section, field, value) => {
    setFormConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };
  
  // The key change: Using a container with absolute height and fixed position for the header
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
          paddingTop: '110px', // Space for the fixed header
          paddingLeft: '16px',
          paddingRight: '16px',
          paddingBottom: '32px'  // Extra padding at the bottom
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
           

              <Accordion type="multiple" defaultValue={['registration-windows']}>
                {/* Registration Windows Section */}
                <AccordionItem value="registration-windows">
                  <AccordionTrigger>Registration Windows</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6">
                      <div className="flex justify-end">
                        <Button onClick={addRegistrationWindow} variant="outline" size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Window
                        </Button>
                      </div>
                      
                      {Object.entries(formConfig.registrationWindows).map(([windowId, window]) => (
                        <Card key={windowId} className="border-l-4" style={{ borderLeftColor: getStudentTypeInfo(selectedStudentType).color }}>
                          <CardHeader className="flex flex-row items-center justify-between p-4">
                            <CardTitle className="text-base font-medium">{window.displayName}</CardTitle>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => deleteRegistrationWindow(windowId)}
                            >
                              <Trash2 className="w-4 h-4 text-gray-500" />
                            </Button>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`${windowId}-name`}>Display Name</Label>
                                <Input 
                                  id={`${windowId}-name`}
                                  value={window.displayName} 
                                  onChange={(e) => updateWindowField(windowId, 'displayName', e.target.value)}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`${windowId}-description`}>Description</Label>
                                <Input 
                                  id={`${windowId}-description`}
                                  value={window.displayDescription} 
                                  onChange={(e) => updateWindowField(windowId, 'displayDescription', e.target.value)}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`${windowId}-reg-start`}>Registration Start Date</Label>
                                <Input 
                                  id={`${windowId}-reg-start`}
                                  type="date" 
                                  value={window.registrationStart} 
                                  onChange={(e) => updateWindowField(windowId, 'registrationStart', e.target.value)}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`${windowId}-reg-end`}>Registration End Date</Label>
                                <Input 
                                  id={`${windowId}-reg-end`}
                                  type="date" 
                                  value={window.registrationEnd} 
                                  onChange={(e) => updateWindowField(windowId, 'registrationEnd', e.target.value)}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`${windowId}-course-start-min`}>Earliest Course Start Date</Label>
                                <Input 
                                  id={`${windowId}-course-start-min`}
                                  type="date" 
                                  value={window.courseStartMin} 
                                  onChange={(e) => updateWindowField(windowId, 'courseStartMin', e.target.value)}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`${windowId}-course-start-max`}>Latest Course Start Date</Label>
                                <Input 
                                  id={`${windowId}-course-start-max`}
                                  type="date" 
                                  value={window.courseStartMax} 
                                  onChange={(e) => updateWindowField(windowId, 'courseStartMax', e.target.value)}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`${windowId}-course-end-max`}>Latest Course End Date</Label>
                                <Input 
                                  id={`${windowId}-course-end-max`}
                                  type="date" 
                                  value={window.courseEndMax} 
                                  onChange={(e) => updateWindowField(windowId, 'courseEndMax', e.target.value)}
                                />
                              </div>
                              
                              <div className="flex items-center space-x-2 pt-6">
                                <Switch 
                                  id={`${windowId}-active`}
                                  checked={window.active} 
                                  onCheckedChange={(checked) => updateWindowField(windowId, 'active', checked)}
                                />
                                <Label htmlFor={`${windowId}-active`}>Active</Label>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Date Rules Section */}
                <AccordionItem value="date-rules">
                  <AccordionTrigger>Date Rules</AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="min-start-offset">Minimum Start Offset (Business Days)</Label>
                            <Input 
                              id="min-start-offset"
                              type="number" 
                              min="0"
                              value={formConfig.dateRules.minStartOffset} 
                              onChange={(e) => updateRulesField('dateRules', 'minStartOffset', parseInt(e.target.value))}
                            />
                            <p className="text-xs text-gray-500">
                              Minimum number of business days from today that a course can start
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="min-duration">Minimum Course Duration (Days)</Label>
                            <Input 
                              id="min-duration"
                              type="number" 
                              min="1"
                              value={formConfig.dateRules.minDuration} 
                              onChange={(e) => updateRulesField('dateRules', 'minDuration', parseInt(e.target.value))}
                            />
                            <p className="text-xs text-gray-500">
                              Minimum number of days required between start and end dates
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="recommended-duration">Recommended Duration (Days)</Label>
                            <Input 
                              id="recommended-duration"
                              type="number" 
                              min="1"
                              value={formConfig.dateRules.recommendedDuration} 
                              onChange={(e) => updateRulesField('dateRules', 'recommendedDuration', parseInt(e.target.value))}
                            />
                            <p className="text-xs text-gray-500">
                              Recommended number of days for course completion
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="date-selection-help">Date Selection Help Text</Label>
                            <Input 
                              id="date-selection-help"
                              value={formConfig.dateRules.dateSelectionHelp} 
                              onChange={(e) => updateRulesField('dateRules', 'dateSelectionHelp', e.target.value)}
                            />
                            <p className="text-xs text-gray-500">
                              Helper text displayed to students when selecting dates
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Age Rules Section */}
                <AccordionItem value="age-rules">
                  <AccordionTrigger>Age Rules</AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="min-age">Minimum Age</Label>
                            <Input 
                              id="min-age"
                              type="number" 
                              min="0"
                              value={formConfig.ageRules.minAge === null ? '' : formConfig.ageRules.minAge} 
                              onChange={(e) => updateRulesField('ageRules', 'minAge', e.target.value === '' ? null : parseInt(e.target.value))}
                            />
                            <p className="text-xs text-gray-500">
                              Minimum age required (empty for no minimum)
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="max-age">Maximum Age</Label>
                            <Input 
                              id="max-age"
                              type="number" 
                              min="0"
                              value={formConfig.ageRules.maxAge === null ? '' : formConfig.ageRules.maxAge} 
                              onChange={(e) => updateRulesField('ageRules', 'maxAge', e.target.value === '' ? null : parseInt(e.target.value))}
                            />
                            <p className="text-xs text-gray-500">
                              Maximum age allowed (empty for no maximum)
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="calculation-date">Age Calculation Date</Label>
                            <Input 
                              id="calculation-date"
                              type="date" 
                              value={formConfig.ageRules.calculationDate} 
                              onChange={(e) => updateRulesField('ageRules', 'calculationDate', e.target.value)}
                            />
                            <p className="text-xs text-gray-500">
                              Date used to calculate student age (e.g., September 1st)
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="age-display-message">Age Display Message</Label>
                            <Input 
                              id="age-display-message"
                              value={formConfig.ageRules.displayMessage} 
                              onChange={(e) => updateRulesField('ageRules', 'displayMessage', e.target.value)}
                            />
                            <p className="text-xs text-gray-500">
                              Message displayed to students about age requirements
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Summer Rules Section */}
                <AccordionItem value="summer-rules">
                  <AccordionTrigger>Summer Rules</AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardContent className="p-6">
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="allowed-in-summer" className="text-base">Allowed in Summer</Label>
                              <p className="text-sm text-gray-500">
                                Can this student type register for courses during summer months?
                              </p>
                            </div>
                            <Switch 
                              id="allowed-in-summer"
                              checked={formConfig.summerRules.allowedInSummer} 
                              onCheckedChange={(checked) => updateRulesField('summerRules', 'allowedInSummer', checked)}
                            />
                          </div>
                          
                          {selectedStudentType === 'Summer School' && (
                            <div className="flex items-center justify-between">
                              <div>
                                <Label htmlFor="restrict-to-summer" className="text-base">Restrict to Summer Months</Label>
                                <p className="text-sm text-gray-500">
                                  Require that courses start and end during summer months
                                </p>
                              </div>
                              <Switch 
                                id="restrict-to-summer"
                                checked={formConfig.summerRules.restrictToSummerMonths || false} 
                                onCheckedChange={(checked) => updateRulesField('summerRules', 'restrictToSummerMonths', checked)}
                              />
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <Label htmlFor="summer-notice">Summer Notice</Label>
                            <Input 
                              id="summer-notice"
                              value={formConfig.summerRules.summerNotice} 
                              onChange={(e) => updateRulesField('summerRules', 'summerNotice', e.target.value)}
                            />
                            <p className="text-xs text-gray-500">
                              Notice displayed when a course is scheduled during summer months
                            </p>
                          </div>
                          
                          {selectedStudentType === 'Summer School' && (
                            <div className="space-y-2">
                              <Label htmlFor="summer-restriction-message">Summer Restriction Message</Label>
                              <Input 
                                id="summer-restriction-message"
                                value={formConfig.summerRules.restrictionMessage || 'Summer school courses must end in July or August'} 
                                onChange={(e) => updateRulesField('summerRules', 'restrictionMessage', e.target.value)}
                              />
                              <p className="text-xs text-gray-500">
                                Message displayed when enforcing summer month restrictions
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Diploma Rules Section */}
                <AccordionItem value="diploma-rules">
                  <AccordionTrigger>Diploma Rules</AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardContent className="p-6">
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="end-date-is-exam-date" className="text-base">End Date is Exam Date</Label>
                              <p className="text-sm text-gray-500">
                                Set course end date to match the selected diploma exam date
                              </p>
                            </div>
                            <Switch 
                              id="end-date-is-exam-date"
                              checked={formConfig.diplomaRules.endDateIsExamDate} 
                              onCheckedChange={(checked) => updateRulesField('diplomaRules', 'endDateIsExamDate', checked)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="allow-already-wrote" className="text-base">Allow "Already Wrote Diploma" Option</Label>
                              <p className="text-sm text-gray-500">
                                Allow students to indicate they've already taken the diploma exam
                              </p>
                            </div>
                            <Switch 
                              id="allow-already-wrote"
                              checked={formConfig.diplomaRules.allowAlreadyWrote} 
                              onCheckedChange={(checked) => updateRulesField('diplomaRules', 'allowAlreadyWrote', checked)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="already-wrote-default-duration">Default Duration if Already Wrote (Days)</Label>
                            <Input 
                              id="already-wrote-default-duration"
                              type="number" 
                              min="1"
                              value={formConfig.diplomaRules.alreadyWroteDefaultDuration} 
                              onChange={(e) => updateRulesField('diplomaRules', 'alreadyWroteDefaultDuration', parseInt(e.target.value))}
                            />
                            <p className="text-xs text-gray-500">
                              Default course duration when student already wrote the diploma
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Document Rules Section (for International Students) */}
                {selectedStudentType === 'International Student' && (
                  <AccordionItem value="document-rules">
                    <AccordionTrigger>Document Requirements</AccordionTrigger>
                    <AccordionContent>
                      <Card>
                        <CardContent className="p-6">
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label htmlFor="documents-required" className="text-base">Documents Required</Label>
                                <p className="text-sm text-gray-500">
                                  Require document uploads for international students
                                </p>
                              </div>
                              <Switch 
                                id="documents-required"
                                checked={formConfig.documentRules?.required || false} 
                                onCheckedChange={(checked) => {
                                  if (!formConfig.documentRules) {
                                    setFormConfig(prev => ({
                                      ...prev,
                                      documentRules: {
                                        required: checked,
                                        requiredDocuments: ['passport', 'additionalID', 'residencyProof'],
                                        documentMessages: {
                                          passport: 'Please upload a copy of your passport',
                                          additionalID: 'Please upload additional identification',
                                          residencyProof: 'Please upload proof of residency'
                                        }
                                      }
                                    }));
                                  } else {
                                    updateRulesField('documentRules', 'required', checked);
                                  }
                                }}
                              />
                            </div>
                            
                            {formConfig.documentRules?.required && (
                              <>
                                <div className="space-y-2">
                                  <Label className="text-base">Required Documents</Label>
                                  <div className="grid grid-cols-1 gap-4">
                                    {['passport', 'additionalID', 'residencyProof'].map(docType => {
                                      const isRequired = formConfig.documentRules.requiredDocuments?.includes(docType) || false;
                                      return (
                                        <div key={docType} className="flex items-center justify-between">
                                          <Label htmlFor={`required-${docType}`} className="flex items-center">
                                            <div className="ml-2">
                                              {docType === 'passport' && 'Passport'}
                                              {docType === 'additionalID' && 'Additional ID'}
                                              {docType === 'residencyProof' && 'Proof of Residency'}
                                            </div>
                                          </Label>
                                          <Switch 
                                            id={`required-${docType}`}
                                            checked={isRequired} 
                                            onCheckedChange={(checked) => {
                                              let requiredDocs = [...(formConfig.documentRules.requiredDocuments || [])];
                                              if (checked && !requiredDocs.includes(docType)) {
                                                requiredDocs.push(docType);
                                              } else if (!checked && requiredDocs.includes(docType)) {
                                                requiredDocs = requiredDocs.filter(d => d !== docType);
                                              }
                                              setFormConfig(prev => ({
                                                ...prev,
                                                documentRules: {
                                                  ...prev.documentRules,
                                                  requiredDocuments: requiredDocs
                                                }
                                              }));
                                            }}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <Label className="text-base">Document Messages</Label>
                                  {['passport', 'additionalID', 'residencyProof'].map(docType => {
                                    const isRequired = formConfig.documentRules.requiredDocuments?.includes(docType) || false;
                                    if (!isRequired) return null;
                                    
                                    return (
                                      <div key={`msg-${docType}`} className="space-y-2">
                                        <Label htmlFor={`msg-${docType}`}>
                                          {docType === 'passport' && 'Passport Message'}
                                          {docType === 'additionalID' && 'Additional ID Message'}
                                          {docType === 'residencyProof' && 'Proof of Residency Message'}
                                        </Label>
                                        <Input 
                                          id={`msg-${docType}`}
                                          value={formConfig.documentRules.documentMessages?.[docType] || ''} 
                                          onChange={(e) => {
                                            setFormConfig(prev => ({
                                              ...prev,
                                              documentRules: {
                                                ...prev.documentRules,
                                                documentMessages: {
                                                  ...prev.documentRules.documentMessages,
                                                  [docType]: e.target.value
                                                }
                                              }
                                            }));
                                          }}
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
              
              {/* Save Button with extra margin */}
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
    </div>
  );
}

export default RegistrationSettings;