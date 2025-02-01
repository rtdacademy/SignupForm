import React, { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { HelpCircle, RefreshCw } from "lucide-react";
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { ScrollArea } from "../components/ui/scroll-area";
import ErrorHelpDialog from './ErrorHelpDialog';
import PASISyncDialog from './PASISyncDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { getSchoolYearOptions } from '../config/DropdownOptions';
import TabStatusMismatches from './TabStatusMismatches';
import TabMissingRecords from './TabMissingRecords';
import TabFailedLinks from './TabFailedLinks';
import TabManualMapping from './TabManualMapping';

const ERROR_TYPES = {
  existingLinksFailed: {
    title: "Existing Links Failed",
    description: "These are records that already have a link in pasiLinks but encountered an error during validation. This could happen if a PASI record was removed but the link still exists, or if a student course was deleted but the link remains.",
    getCount: (results) => results?.existingLinks?.failed?.length || 0
  },
  newLinksFailed: {
    title: "New Links Failed",
    description: "These are PASI records that aren't linked yet and failed during the linking attempt. This usually happens when a PASI record has no email/ASN, or when we can't find a matching student course in YourWay.",
    getCount: (results) => results?.newLinks?.failed?.length || 0
  },
  needsManualMapping: {
    title: "Needs Manual Course Mapping",
    description: "These are PASI records where we can't automatically map the PASI course code to your internal course ID. This requires manual intervention to create the correct course code mapping.",
    getCount: (results) => results?.newLinks?.needsManualCourseMapping?.length || 0
  },
  statusMismatches: {
    title: "Status Mismatches",
    description: "These records have incompatible statuses between YourWay and PASI. For example, a course marked as 'Active' in PASI shouldn't be marked as 'Completed' in YourWay.",
    getCount: (results) => results?.statusMismatches?.total || 0
  },
  missingPasiRecords: {
    title: "Missing PASI Records",
    description: "These are courses in YourWay that don't have any corresponding PASI record. This could mean the course hasn't been registered in PASI yet, or there might be a synchronization issue.",
    getCount: (results) => results?.studentCourseSummariesMissingPasi?.total || 0
  }
};

const PASISyncReport = () => {
  const [syncResults, setSyncResults] = useState(null);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState('');
  const [schoolYearOptions, setSchoolYearOptions] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const options = getSchoolYearOptions();
    setSchoolYearOptions(options);
    const defaultOption = options.find(opt => opt.isDefault);
    if (defaultOption) {
      setSelectedSchoolYear(defaultOption.value);
    }
  }, []);

  useEffect(() => {
    if (!selectedSchoolYear) return;

    const db = getDatabase();
    const reportRef = ref(db, `pasiSyncReport/schoolYear/${selectedSchoolYear.replace('/', '_')}`);
    
    const unsubscribe = onValue(reportRef, (snapshot) => {
      const data = snapshot.val() || {
        existingLinks: { failed: [] },
        newLinks: { failed: [], needsManualCourseMapping: [] },
        statusMismatches: { total: 0, details: [] },
        studentCourseSummariesMissingPasi: { total: 0, details: [] }
      };
      setSyncResults(data);
    });

    return () => off(reportRef);
  }, [selectedSchoolYear]);

  const renderSyncControls = () => (
    <div className="flex items-center gap-4">
      <Select value={selectedSchoolYear} onValueChange={setSelectedSchoolYear}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Select Year" />
        </SelectTrigger>
        <SelectContent>
          {schoolYearOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <span style={{ color: option.color }}>{option.value}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => setShowSyncDialog(true)}
        disabled={!selectedSchoolYear || isProcessing}
      >
        <RefreshCw className="h-4 w-4" />
        Sync Records
      </Button>

      <Button
        variant="ghost"
        onClick={() => setIsHelpDialogOpen(true)}
        className="flex items-center gap-2"
      >
        <HelpCircle className="h-4 w-4" />
        Help
      </Button>
    </div>
  );

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">PASI Sync Report</h2>
        {syncResults?.lastSync && (
          <div className="text-sm text-muted-foreground">
            Last sync: {new Date(syncResults.lastSync.timestamp).toLocaleString()} by {syncResults.lastSync.initiatedBy}
          </div>
        )}
      </div>
      {renderSyncControls()}
    </div>
  );

  return (
    <>
      <ScrollArea className="h-[800px]">
        <div className="space-y-6 p-6">
          {renderHeader()}
          
          <Tabs defaultValue="status-mismatches" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="status-mismatches">
                Status Mismatches ({ERROR_TYPES.statusMismatches.getCount(syncResults)})
              </TabsTrigger>
              <TabsTrigger value="missing-records">
                Missing PASI Records ({ERROR_TYPES.missingPasiRecords.getCount(syncResults)})
              </TabsTrigger>
              <TabsTrigger value="failed-links">
                Failed Links ({ERROR_TYPES.existingLinksFailed.getCount(syncResults) + 
                  ERROR_TYPES.newLinksFailed.getCount(syncResults)})
              </TabsTrigger>
              <TabsTrigger value="manual-mapping">
                Needs Mapping ({ERROR_TYPES.needsManualMapping.getCount(syncResults)})
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
            <TabsContent value="status-mismatches">
  <TabStatusMismatches 
    data={syncResults?.statusMismatches} 
    schoolYear={selectedSchoolYear.replace('/', '_')}
  />
</TabsContent>
              
              <TabsContent value="missing-records">
  <TabMissingRecords 
    data={syncResults?.studentCourseSummariesMissingPasi} 
    schoolYear={selectedSchoolYear.replace('/', '_')}
  />
</TabsContent>
              
              <TabsContent value="failed-links">
  <TabFailedLinks 
    data={syncResults?.newLinks} 
    schoolYear={selectedSchoolYear.replace('/', '_')} 
  />
</TabsContent>
              
<TabsContent value="manual-mapping">
  <TabManualMapping 
    data={syncResults?.newLinks} 
    schoolYear={selectedSchoolYear.replace('/', '_')} 
  />
</TabsContent>
            </div>
          </Tabs>
        </div>
      </ScrollArea>

      <ErrorHelpDialog 
        isOpen={isHelpDialogOpen}
        onClose={() => setIsHelpDialogOpen(false)}
      />

      <PASISyncDialog 
        isOpen={showSyncDialog}
        onClose={() => setShowSyncDialog(false)}
        schoolYear={selectedSchoolYear}
      />
    </>
  );
};

export default PASISyncReport;