import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Loader2, FileStack, Plus, Minus, RefreshCw, Link, Link2Off, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";

/**
 * Simplified PASIPreviewDialog that shows a summary of the changes that will be made
 * when uploading a PASI records file.
 */
const PASIPreviewDialog = ({ 
  isOpen, 
  onClose, 
  changePreview, 
  onConfirm, 
  isConfirming = false,
  selectedSchoolYear,
  hasAllRequiredFields = true,
  missingFields = []
}) => {
  if (!changePreview) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Processing records...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <p>Analyzing changes to PASI records...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Get statistics from the changePreview object
  const {
    stats = {},
    recordsBeingRemoved = 0,
    totalChanges = 0,
    totalLinks = 0,
    newLinks = 0,
    removedLinks = 0,
    duplicateCount = 0
  } = changePreview;

  // Check if Reference # field is missing specifically
  const isReferenceNumberMissing = missingFields.includes('Reference #');

  // Count student course summary updates
  const studentSummaryUpdateCount = changePreview.studentSummaryUpdates ? 
    Object.keys(changePreview.studentSummaryUpdates).length : 0;

  // Handle the confirmation action
  const handleConfirm = async () => {
    if (!changePreview || !changePreview.newRecordsMap) {
      toast.error('No changes to apply');
      return;
    }
    
    // Close the dialog immediately to improve perceived performance
    onClose();
    
    // Show a toast to indicate background processing
    const progressToast = toast.loading("Processing changes in the background...", {
      duration: Infinity,
      id: "pasi-upload-progress"
    });
    
    // Call the onConfirm callback with the change preview data
    onConfirm({ 
      changePreview,
      progressToastId: progressToast
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>PASI Records Update Summary for {selectedSchoolYear}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {/* Warning for missing required fields */}
          {!hasAllRequiredFields && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Missing Required Fields</AlertTitle>
              <AlertDescription>
                <p className="mb-2">The uploaded CSV is missing the following required fields:</p>
                <ul className="list-disc pl-5 mb-3">
                  {missingFields.map(field => (
                    <li key={field}>{field}</li>
                  ))}
                </ul>
                
                {isReferenceNumberMissing && (
                  <div className="mt-3 p-3 border border-amber-300 bg-amber-50 rounded-md text-amber-800">
                    <p className="font-medium mb-1">About the "Reference #" field:</p>
                    <p>
                      This field is not included in the default PASI export view. You need to customize 
                      the PASI export to include the Reference # column before downloading the CSV.
                    </p>
                    <p className="mt-2">
                      The Reference # is critical as it allows us to directly link records to students 
                      in PASI and ensures proper identification of records.
                    </p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Summary Statistics */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {/* Total Records */}
            <div className="bg-slate-50 p-3 rounded-md">
              <div className="text-sm text-slate-500">Total Records</div>
              <div className="text-2xl font-semibold">
                {stats.total || (stats.new + stats.updated + stats.removed + (stats.unchanged || 0))}
              </div>
            </div>
            
            {/* Total Changes */}
            <div className="bg-amber-50 p-3 rounded-md">
              <div className="text-sm text-amber-700">Total Changes</div>
              <div className="text-2xl font-semibold text-amber-800">
                {totalChanges}
              </div>
            </div>
            
            {/* New Records */}
            <div className="bg-green-50 p-3 rounded-md">
              <div className="flex items-center gap-1 text-sm text-green-700">
                <Plus className="h-3.5 w-3.5" />
                <span>New Records</span>
              </div>
              <div className="text-xl font-semibold text-green-800">
                {stats.new || 0}
              </div>
            </div>
            
            {/* Updated Records */}
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="flex items-center gap-1 text-sm text-blue-700">
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Updated Records</span>
              </div>
              <div className="text-xl font-semibold text-blue-800">
                {stats.updated || 0}
              </div>
            </div>
            
            {/* Records to Remove */}
            <div className="bg-red-50 p-3 rounded-md">
              <div className="flex items-center gap-1 text-sm text-red-700">
                <Minus className="h-3.5 w-3.5" />
                <span>Records to Remove</span>
              </div>
              <div className="text-xl font-semibold text-red-800">
                {stats.removed || recordsBeingRemoved || 0}
              </div>
            </div>
            
            {/* Duplicate Records */}
            {duplicateCount > 0 && (
              <div className="bg-purple-50 p-3 rounded-md">
                <div className="flex items-center gap-1 text-sm text-purple-700">
                  <FileStack className="h-3.5 w-3.5" />
                  <span>Duplicate Records</span>
                </div>
                <div className="text-xl font-semibold text-purple-800">
                  {duplicateCount}
                </div>
              </div>
            )}
          </div>
          
          {/* Link Statistics */}
          {(totalLinks > 0 || newLinks > 0 || removedLinks > 0) && (
            <div className="border border-blue-200 bg-blue-50 p-3 rounded-md mb-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Link Information</h3>
              <div className="grid grid-cols-4 gap-2">
                {totalLinks > 0 && (
                  <div>
                    <div className="text-xs text-blue-600">Linked Records</div>
                    <div className="text-lg font-medium text-blue-800">{totalLinks}</div>
                  </div>
                )}
                
                {newLinks > 0 && (
                  <div>
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <Link className="h-3 w-3" />
                      <span>New Links</span>
                    </div>
                    <div className="text-lg font-medium text-blue-800">{newLinks}</div>
                  </div>
                )}
                
                {removedLinks > 0 && (
                  <div>
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <Link2Off className="h-3 w-3" />
                      <span>Links Removed</span>
                    </div>
                    <div className="text-lg font-medium text-blue-800">{removedLinks}</div>
                  </div>
                )}
                
                {studentSummaryUpdateCount > 0 && (
                  <div>
                    <div className="text-xs text-blue-600">Student Records Updated</div>
                    <div className="text-lg font-medium text-blue-800">{studentSummaryUpdateCount}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isConfirming}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isConfirming || totalChanges === 0 || !hasAllRequiredFields}
          >
            {isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Applying Changes...
              </>
            ) : !hasAllRequiredFields ? (
              "Missing Required Fields"
            ) : (
              `Apply ${totalChanges} Changes`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PASIPreviewDialog;