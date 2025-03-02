import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { toast } from 'sonner';
import { validatePasiRecordsLinkStatus, fixPasiRecordLinkStatus } from '../utils/pasiValidation';
import { getDatabase, ref, get, update } from 'firebase/database';

const PASILinkValidation = ({ selectedSchoolYear }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [selectedRecords, setSelectedRecords] = useState(new Set());
  const [isFixing, setIsFixing] = useState(false);
  
  const handleValidate = async () => {
    if (!selectedSchoolYear) {
      toast.error("Please select a school year first");
      return;
    }
    
    setIsValidating(true);
    try {
      const formattedYear = selectedSchoolYear.replace('/', '_');
      const results = await validatePasiRecordsLinkStatus(formattedYear);
      setValidationResults(results);
      // Clear any previously selected records
      setSelectedRecords(new Set());
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("Failed to validate PASI records: " + error.message);
    } finally {
      setIsValidating(false);
    }
  };
  
  const handleToggleSelectAll = () => {
    if (selectedRecords.size === validationResults.validationResults.filter(r => !r.isCorrect).length) {
      // If all are selected, clear the selection
      setSelectedRecords(new Set());
    } else {
      // Otherwise, select all incorrect records
      const newSelected = new Set();
      validationResults.validationResults.forEach(result => {
        if (!result.isCorrect) {
          newSelected.add(result.recordId);
        }
      });
      setSelectedRecords(newSelected);
    }
  };
  
  const handleToggleSelect = (recordId) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(recordId)) {
      newSelected.delete(recordId);
    } else {
      newSelected.add(recordId);
    }
    setSelectedRecords(newSelected);
  };
  
  const handleFixSelected = async () => {
    if (selectedRecords.size === 0) {
      toast.info("No records selected to fix");
      return;
    }
    
    setIsFixing(true);
    try {
      // Get all PASI links to determine correct status
      const db = getDatabase();
      const pasiLinksSnapshot = await get(ref(db, 'pasiLinks'));
      
      // Create a Set of pasiRecordIds that are linked
      const linkedRecordIds = new Set();
      
      if (pasiLinksSnapshot.exists()) {
        pasiLinksSnapshot.forEach(linkSnapshot => {
          const link = linkSnapshot.val();
          if (link.pasiRecordId) {
            linkedRecordIds.add(link.pasiRecordId);
          }
        });
      }
      
      // Prepare batch updates
      const updates = {};
      
      Array.from(selectedRecords).forEach(recordId => {
        const shouldBeLinked = linkedRecordIds.has(recordId);
        updates[`pasiRecords/${recordId}/linked`] = shouldBeLinked;
      });
      
      // Apply all updates in a single batch operation
      await update(ref(db), updates);
      
      toast.success(`Fixed ${selectedRecords.size} records successfully`);
      
      // Re-validate to show updated results
      await handleValidate();
    } catch (error) {
      console.error("Error fixing records:", error);
      toast.error("Failed to fix records: " + error.message);
    } finally {
      setIsFixing(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>PASI Link Validation</CardTitle>
        <p className="text-sm text-muted-foreground">
          Verify that the 'linked' property of PASI records matches actual links in the database
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={handleValidate}
            disabled={isValidating || !selectedSchoolYear}
          >
            {isValidating ? "Validating..." : "Validate Links"}
          </Button>
          
          {validationResults && validationResults.summary.incorrectlyMarked > 0 && (
            <Button
              variant="secondary"
              onClick={handleFixSelected}
              disabled={isFixing || selectedRecords.size === 0}
            >
              {isFixing ? "Fixing..." : `Fix Selected (${selectedRecords.size})`}
            </Button>
          )}
        </div>
        
        {validationResults && (
          <>
            <Alert className="mb-6">
              <AlertTitle>Validation Results</AlertTitle>
              <AlertDescription>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <div>
                    <p className="text-sm font-medium">Total Records:</p>
                    <p>{validationResults.summary.totalChecked}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-600">Correctly Marked:</p>
                    <p>{validationResults.summary.correctlyMarked}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600">Incorrectly Marked:</p>
                    <p>{validationResults.summary.incorrectlyMarked}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Accuracy:</p>
                    <p>{validationResults.summary.accuracyPercentage}%</p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
            
            {validationResults.summary.incorrectlyMarked > 0 ? (
              <>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Records Needing Correction</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleSelectAll}
                  >
                    {selectedRecords.size === validationResults.validationResults.filter(r => !r.isCorrect).length
                      ? "Deselect All"
                      : "Select All"
                    }
                  </Button>
                </div>
                
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]"></TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Course Code</TableHead>
                        <TableHead>Status in DB</TableHead>
                        <TableHead>Actual Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationResults.validationResults
                        .filter(result => !result.isCorrect)
                        .map(result => (
                          <TableRow 
                            key={result.recordId}
                            className={selectedRecords.has(result.recordId) ? "bg-muted/50" : ""}
                          >
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedRecords.has(result.recordId)}
                                onChange={() => handleToggleSelect(result.recordId)}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                            </TableCell>
                            <TableCell className="font-medium">{result.studentName}</TableCell>
                            <TableCell>{result.courseCode}</TableCell>
                            <TableCell>
                              <Badge
                                variant={result.isMarkedLinked ? "success" : "secondary"}
                              >
                                {result.isMarkedLinked ? "Linked" : "Not Linked"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={result.isActuallyLinked ? "success" : "secondary"}
                              >
                                {result.isActuallyLinked ? "Linked" : "Not Linked"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : (
              <div className="p-4 text-center text-green-600 bg-green-50 rounded-md">
                All records are correctly marked. No fixes needed!
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PASILinkValidation;