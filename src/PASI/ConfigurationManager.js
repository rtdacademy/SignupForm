import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { ScrollArea } from "../components/ui/scroll-area";
import { Checkbox } from "../components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { 
  Calendar, 
  Save, 
  Loader2, 
  Info
} from 'lucide-react';
import { toast } from 'sonner';

// Import database functionality
import { ref, get, set, update } from 'firebase/database';
import { database } from '../firebase';

const ConfigurationManager = ({ onConfigChange, onCutoffDateChange }) => {
  // State for configurations
  const [termCutoffDate, setTermCutoffDate] = useState('2025-01-30'); // Default date from the original code
  const [septemberCutoffDate, setSeptemberCutoffDate] = useState('2024-09-01'); // Default date for September cutoff
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Path to configuration in Firebase
  const CONFIG_PATH = '/configuration/GeneralSettings';
  
  // Load configurations when component mounts
  useEffect(() => {
    const fetchConfigurations = async () => {
      try {
        setLoading(true);
        const configRef = ref(database, CONFIG_PATH);
        const snapshot = await get(configRef);
        
        if (snapshot.exists()) {
          const configData = snapshot.val();
          if (configData.termCutoffDate) {
            setTermCutoffDate(configData.termCutoffDate);
            
            // Pass to parent components
            if (onCutoffDateChange) {
              onCutoffDateChange(configData.termCutoffDate);
            }
            
            if (onConfigChange) {
              // Notify parent component of initial configuration
              onConfigChange({ 
                termCutoffDate: configData.termCutoffDate,
                septemberCutoffDate: configData.septemberCutoffDate || '2024-09-01'
              });
            }
          }
          
          // Load September cutoff date if it exists
          if (configData.septemberCutoffDate) {
            setSeptemberCutoffDate(configData.septemberCutoffDate);
          }
        } else {
          // Initialize with default date if not yet set
          if (onCutoffDateChange) {
            onCutoffDateChange(termCutoffDate);
          }
          
          if (onConfigChange) {
            onConfigChange({ 
              termCutoffDate,
              septemberCutoffDate 
            });
          }
        }
      } catch (error) {
        console.error('Error loading configurations:', error);
        toast.error('Failed to load configurations');
      } finally {
        setLoading(false);
      }
    };
    
    fetchConfigurations();
  }, [onConfigChange, onCutoffDateChange]);
  
  // Save the configuration to Firebase
  const saveConfiguration = async () => {
    setSaving(true);
    try {
      // First check if the path exists
      const configRef = ref(database, '/configuration');
      const configSnapshot = await get(configRef);
      
      if (!configSnapshot.exists()) {
        // Create the configuration node first
        await set(configRef, { initialized: true });
      }
      
      // Save both cutoff dates and any other configurations
      await update(ref(database, CONFIG_PATH), {
        termCutoffDate,
        septemberCutoffDate,
        lastUpdated: new Date().toISOString()
      });
      
      // Notify parent of the change
      if (onConfigChange) {
        onConfigChange({ 
          termCutoffDate,
          septemberCutoffDate
        });
      }
      
      // Also notify through the specific cutoff date handler if available
      if (onCutoffDateChange) {
        onCutoffDateChange(termCutoffDate);
      }
      
      toast.success('Configuration saved successfully');
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error(`Failed to save configuration: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle cutoff date change
  const handleCutoffDateChange = (e) => {
    const newDate = e.target.value;
    setTermCutoffDate(newDate);
  };

  // Handle September cutoff date change
  const handleSeptemberCutoffDateChange = (e) => {
    const newDate = e.target.value;
    setSeptemberCutoffDate(newDate);
  };

  // Format a date for display
  const formatDateForDisplay = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Accordion type="single" collapsible defaultValue="">
      <AccordionItem value="configuration">
        <AccordionTrigger className="px-4 py-2 hover:no-underline">
          <div className="flex items-center justify-between w-full">
            <span className="font-medium">System Configuration</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <Card className="mb-6 shadow-none border-t-0 rounded-t-none">
            <CardContent className="space-y-6 pt-4">
              <div className="text-sm text-muted-foreground">
                Configure global system settings that affect how data is processed and displayed.
              </div>
              
              {/* Term 1/Term 2 cutoff configuration */}
              <div className="space-y-4">
                <h3 className="text-md font-medium">Term Classification</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="term-cutoff-date">
                    Term 1/Term 2 Cutoff Date
                  </Label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Input
                        id="term-cutoff-date"
                        type="date"
                        value={termCutoffDate}
                        onChange={handleCutoffDateChange}
                        className="w-full pr-10"
                        disabled={loading}
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    </div>
                    <Button
                      onClick={saveConfiguration}
                      disabled={saving || loading}
                      className="min-w-[100px]"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="flex items-start gap-2 mt-2 text-sm text-muted-foreground">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p>Students who have completed courses <strong>before</strong> {formatDateForDisplay(termCutoffDate)} will be classified as Term 1 students.</p>
                      <p>Students who complete courses <strong>on or after</strong> {formatDateForDisplay(termCutoffDate)} will be classified as Term 2 students.</p>
                    </div>
                  </div>
                </div>
                
                {/* September cutoff configuration */}
                <div className="space-y-2 mt-4">
                  <Label htmlFor="september-cutoff-date">
                    September Cutoff Date
                  </Label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Input
                        id="september-cutoff-date"
                        type="date"
                        value={septemberCutoffDate}
                        onChange={handleSeptemberCutoffDateChange}
                        className="w-full pr-10"
                        disabled={loading}
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    </div>
                    <Button
                      onClick={saveConfiguration}
                      disabled={saving || loading}
                      className="min-w-[100px]"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="flex items-start gap-2 mt-2 text-sm text-muted-foreground">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p>The September Cutoff Date is used to determine the start of the new school year.</p>
                      <p>This date is typically set to September 1st of the current school year.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional configuration sections can be added here */}
            </CardContent>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ConfigurationManager;