import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { 
  Trash, 
  RefreshCw,
  ChevronDown,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";

// Firebase imports
import { ref, get, set, update, onValue, off } from 'firebase/database';
import { database } from '../firebase';

// Import term options
import { TERM_OPTIONS, getTermInfo } from "../config/DropdownOptions";

const TermMappingManager = ({ onMappingsChange }) => {
  // State for grouped mappings
  const [groupedMappings, setGroupedMappings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Use ref to keep track of latest callback without causing effect to re-run
  const onMappingsChangeRef = useRef(onMappingsChange);
  
  // Update ref when callback changes
  useEffect(() => {
    onMappingsChangeRef.current = onMappingsChange;
  }, [onMappingsChange]);
  
  // State for new mapping form - only keeping for editing existing mappings
  const [newMapping, setNewMapping] = useState({
    yourWayTerm: TERM_OPTIONS[0]?.value || '',
    pasiTerm: '',
    notes: ''
  });
  
  // Path to mappings in Firebase
  const MAPPINGS_PATH = '/configuration/TermComparisons';
  
  // Function to initialize the path in Firebase if it doesn't exist (for internal use only)
  const initializePath = async () => {
    try {
      // Check if path exists
      const configRef = ref(database, '/configuration');
      const configSnapshot = await get(configRef);
      
      if (!configSnapshot.exists()) {
        // Create the configuration node first
        await set(configRef, { initialized: true });
      }
      
      // Check if TermComparisons exists
      const mappingsRef = ref(database, MAPPINGS_PATH);
      const mappingsSnapshot = await get(mappingsRef);
      
      if (!mappingsSnapshot.exists()) {
        // Initialize with a sample mapping
        const fallTerm = TERM_OPTIONS[0]?.value || 'fall';
        
        // Create an example structure with a 1-to-many mapping
        const initialData = {
          [fallTerm]: {
            pasiTerms: ["1", "S1"],
            notes: "Initial mapping created automatically"
          }
        };
        
        await set(mappingsRef, initialData);
        toast.success('Created Term Comparisons database node');
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing path:', error);
      toast.error(`Failed to initialize database path: ${error.message}`);
      return false;
    }
  };
  
  // Set up real-time listener for mappings - only on mount
  useEffect(() => {
    let isMounted = true;
    const mappingsRef = ref(database, MAPPINGS_PATH);
    
    // Check if path exists first
    get(mappingsRef).then(snapshot => {
      if (!snapshot.exists() && isMounted) {
        initializePath().then(() => {
          // After initialization, set up the listener
          setupListener();
        });
      } else {
        // Path exists, set up listener directly
        setupListener();
      }
    }).catch(error => {
      console.error('Error checking if path exists:', error);
      if (isMounted) {
        toast.error(`Failed to check database path: ${error.message}`);
        setLoading(false);
      }
    });
    
    function setupListener() {
      if (!isMounted) return;
      
      // Set up listener
      const unsubscribe = onValue(mappingsRef, (snapshot) => {
        if (!isMounted) return;
        
        if (snapshot.exists()) {
          const mappingsData = snapshot.val();
          
          setGroupedMappings(mappingsData);
          
          // Notify parent component of mappings change
          if (onMappingsChangeRef.current) {
            // Convert to a lookup format for easy checking
            const lookupMap = {};
            Object.entries(mappingsData).forEach(([yourWayTerm, data]) => {
              lookupMap[yourWayTerm] = data.pasiTerms || [];
            });
            onMappingsChangeRef.current(lookupMap);
          }
        } else {
          setGroupedMappings({});
          if (onMappingsChangeRef.current) {
            onMappingsChangeRef.current({});
          }
        }
        setLoading(false);
      }, (error) => {
        console.error('Error setting up mappings listener:', error);
        if (isMounted) {
          toast.error(`Failed to set up real-time sync: ${error.message}`);
          setLoading(false);
        }
      });
      
      return unsubscribe;
    }
    
    // Clean up function
    return () => {
      isMounted = false;
      off(mappingsRef);
    };
  }, []);
  
  // Function to save all mappings to Firebase
  const saveAllMappings = async () => {
    setSaving(true);
    try {
      // First check if the path exists
      const configRef = ref(database, '/configuration');
      const configSnapshot = await get(configRef);
      
      if (!configSnapshot.exists()) {
        // Create the configuration node first
        await set(configRef, { initialized: true });
      }
      
      // Try to save with update first (which is safer for paths that might not exist)
      try {
        // Create an update object with the full path
        const updates = {};
        updates[MAPPINGS_PATH] = groupedMappings;
        
        await update(ref(database), updates);
      } catch (updateError) {
        console.warn("Update method failed, trying set method:", updateError);
        
        // If update fails, try the direct set method
        await set(ref(database, MAPPINGS_PATH), groupedMappings);
      }
    } catch (error) {
      console.error('Error saving term mappings:', error);
      toast.error(`Failed to save term mappings: ${error.message}`);
      
      // Try to initialize the path if this might be the issue
      if (error.message.includes('permission_denied') || error.message.includes('not found')) {
        await initializePath();
      }
    } finally {
      setSaving(false);
    }
  };
  
  // Function to handle input change in the new mapping form
  const handleNewMappingChange = (field, value) => {
    setNewMapping(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Function to add a new mapping with auto-save
  const addNewMapping = async () => {
    // Validate inputs
    if (!newMapping.yourWayTerm) {
      toast.error('Please select a YourWay term');
      return;
    }
    
    if (!newMapping.pasiTerm) {
      toast.error('Please enter a PASI term');
      return;
    }
    
    // Update the grouped mappings
    setGroupedMappings(prev => {
      const updatedMappings = { ...prev };
      
      // Check if this YourWay term already exists
      if (updatedMappings[newMapping.yourWayTerm]) {
        // Check if this PASI term already exists for this YourWay term
        const existingPasiTerms = updatedMappings[newMapping.yourWayTerm].pasiTerms || [];
        
        if (existingPasiTerms.includes(newMapping.pasiTerm)) {
          toast.error(`PASI term "${newMapping.pasiTerm}" already exists for this YourWay term`);
          return prev;
        }
        
        // Add the new PASI term to the existing array
        updatedMappings[newMapping.yourWayTerm] = {
          ...updatedMappings[newMapping.yourWayTerm],
          pasiTerms: [...existingPasiTerms, newMapping.pasiTerm]
        };
        
        // Update notes if provided
        if (newMapping.notes && !updatedMappings[newMapping.yourWayTerm].notes) {
          updatedMappings[newMapping.yourWayTerm].notes = newMapping.notes;
        }
      } else {
        // Create a new entry for this YourWay term
        updatedMappings[newMapping.yourWayTerm] = {
          pasiTerms: [newMapping.pasiTerm],
          notes: newMapping.notes || ''
        };
      }
      
      return updatedMappings;
    });
    
    // Reset the PASI term and notes fields but keep the YourWay term selection
    setNewMapping(prev => ({
      ...prev,
      pasiTerm: '',
      notes: ''
    }));
    
    // Auto-save changes
    await saveAllMappings();
    
    toast.success('New mapping added and saved');
  };
  
  // Function to update notes for a YourWay term with auto-save
  const updateNotes = async (yourWayTerm, notes) => {
    setGroupedMappings(prev => {
      const updatedMappings = { ...prev };
      
      if (updatedMappings[yourWayTerm]) {
        updatedMappings[yourWayTerm] = {
          ...updatedMappings[yourWayTerm],
          notes
        };
      }
      
      return updatedMappings;
    });
    
    // Auto-save changes
    await saveAllMappings();
  };
  
  // Function to delete a PASI term from a YourWay term with auto-save
  const deletePasiTerm = async (yourWayTerm, pasiTerm) => {
    setGroupedMappings(prev => {
      const updatedMappings = { ...prev };
      
      if (updatedMappings[yourWayTerm]) {
        const pasiTerms = updatedMappings[yourWayTerm].pasiTerms || [];
        
        // Filter out the PASI term to remove
        const updatedPasiTerms = pasiTerms.filter(term => term !== pasiTerm);
        
        // If there are still PASI terms left, update the array
        if (updatedPasiTerms.length > 0) {
          updatedMappings[yourWayTerm] = {
            ...updatedMappings[yourWayTerm],
            pasiTerms: updatedPasiTerms
          };
        } else {
          // If no PASI terms left, remove the entire YourWay term entry
          delete updatedMappings[yourWayTerm];
        }
      }
      
      return updatedMappings;
    });
    
    // Auto-save changes
    await saveAllMappings();
    
    toast.success(`Removed PASI term "${pasiTerm}" from mapping`);
  };
  
  // Function to delete an entire YourWay term mapping with auto-save
  const deleteYourWayTermMapping = async (yourWayTerm) => {
    setGroupedMappings(prev => {
      const updatedMappings = { ...prev };
      
      // Remove the entire YourWay term entry
      delete updatedMappings[yourWayTerm];
      
      return updatedMappings;
    });
    
    // Auto-save changes
    await saveAllMappings();
    
    toast.success(`Removed entire mapping for "${yourWayTerm}"`);
  };
  
  // Calculate total number of mappings
  const totalMappings = Object.values(groupedMappings).reduce((total, mapping) => {
    return total + (mapping.pasiTerms?.length || 0);
  }, 0);

  return (
    <Accordion type="single" collapsible defaultValue="">
      <AccordionItem value="term-mapping">
        <AccordionTrigger className="px-4 py-2 hover:no-underline">
          <div className="flex items-center justify-between w-full">
            <span className="font-medium">Term Mapping Rules</span>
            <div className="flex gap-2 items-center">
              <Badge variant="outline">
                {Object.keys(groupedMappings).length} YourWay Terms
              </Badge>
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
                {totalMappings} Total Mappings
              </Badge>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <Card className="mb-6 shadow-none border-t-0 rounded-t-none">
            <CardContent className="space-y-4 pt-4">
              <div className="text-sm text-muted-foreground">
                Define which PASI terms are compatible with each YourWay term. Any YourWay/PASI term
                combinations not defined here will be considered incompatible.
              </div>
              
              {/* Existing mappings list */}
              <div>
                {loading ? (
                  <div className="py-4 text-center text-muted-foreground">
                    <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
                    Loading mappings...
                  </div>
                ) : Object.keys(groupedMappings).length === 0 ? (
                  <div className="py-4 text-center text-muted-foreground">
                    No term mappings defined.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupedMappings).map(([yourWayTerm, data]) => {
                      const termInfo = getTermInfo(yourWayTerm);
                      const pasiTerms = data.pasiTerms || [];
                      
                      return (
                        <Card key={yourWayTerm} className="border-l-4" style={{ borderLeftColor: termInfo.color }}>
                          <CardHeader className="py-3">
                            <CardTitle className="text-base flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {termInfo.icon && (
                                  <termInfo.icon 
                                    className="h-5 w-5" 
                                    style={{ color: termInfo.color }}
                                  />
                                )}
                                <span>{termInfo.label}</span>
                                <Badge 
                                  variant="outline"
                                  className="ml-2"
                                  style={{ backgroundColor: `${termInfo.color}15`, color: termInfo.color }}
                                >
                                  {pasiTerms.length} PASI {pasiTerms.length === 1 ? 'Term' : 'Terms'}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteYourWayTermMapping(yourWayTerm)}
                                title="Delete this entire mapping"
                                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                disabled={saving}
                              >
                                <Trash className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="grid grid-cols-12 gap-4 mb-2">
                              <div className="col-span-9">
                                <Input
                                  value={data.notes || ''}
                                  onChange={(e) => updateNotes(yourWayTerm, e.target.value)}
                                  placeholder="Notes about this mapping (optional)"
                                  onBlur={(e) => updateNotes(yourWayTerm, e.target.value)}
                                />
                              </div>
                              <div className="col-span-3 text-sm text-muted-foreground pt-2">
                                <div className="italic">Compatible PASI Terms:</div>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mt-2">
                              {pasiTerms.map(pasiTerm => (
                                <Badge 
                                  key={`${yourWayTerm}-${pasiTerm}`}
                                  variant="default"
                                  className="py-1 px-3 flex items-center gap-1 bg-gray-700 text-white hover:bg-gray-600"
                                >
                                  {pasiTerm}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deletePasiTerm(yourWayTerm, pasiTerm)}
                                    title="Remove this PASI term"
                                    className="h-5 w-5 p-0 ml-1 text-white hover:bg-red-500 hover:text-white rounded-full"
                                    disabled={saving}
                                  >
                                    <Trash className="h-3 w-3" />
                                  </Button>
                                </Badge>
                              ))}
                              
                              {/* Add new PASI term directly to this YourWay term */}
                              <div className="flex items-center gap-1">
                                <Input
                                  placeholder="Add new PASI term"
                                  className="max-w-[150px] h-8 text-xs"
                                  value={
                                    newMapping.yourWayTerm === yourWayTerm ? 
                                    newMapping.pasiTerm : 
                                    ''
                                  }
                                  onChange={(e) => {
                                    setNewMapping({
                                      yourWayTerm,
                                      pasiTerm: e.target.value,
                                      notes: ''
                                    });
                                  }}
                                  onClick={() => {
                                    if (newMapping.yourWayTerm !== yourWayTerm) {
                                      setNewMapping({
                                        yourWayTerm,
                                        pasiTerm: '',
                                        notes: ''
                                      });
                                    }
                                  }}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8"
                                  onClick={() => {
                                    if (newMapping.yourWayTerm === yourWayTerm && newMapping.pasiTerm) {
                                      addNewMapping();
                                    }
                                  }}
                                  disabled={
                                    newMapping.yourWayTerm !== yourWayTerm || 
                                    !newMapping.pasiTerm ||
                                    saving
                                  }
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default TermMappingManager;