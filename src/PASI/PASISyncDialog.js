import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { AlertCircle } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { toast } from "sonner";

const PASISyncDialog = ({ isOpen, onClose, schoolYear }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSync = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const functions = getFunctions();
      const syncPasiRecords = httpsCallable(functions, 'syncPasiRecordsV2');
      
      const result = await syncPasiRecords({ schoolYear });
      
      if (result.data.success) {
        toast.success('PASI sync started successfully');
        setIsLoading(false);  // Reset loading state before closing
        onClose();
      } else {
        throw new Error(result.data.message || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      setError(error.message);
      toast.error(`Sync failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle the dialog's open state changes
  const handleOpenChange = (open) => {
    if (!open && !isLoading) {  // Only allow closing if not loading
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm PASI Sync</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p>Are you sure you want to sync PASI records for {schoolYear}?</p>
          <p className="text-sm text-muted-foreground mt-2">
            This process may take a few minutes to complete. You can view the sync progress and results in the main report view.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSync} 
            disabled={isLoading}
          >
            {isLoading ? 'Starting Sync...' : 'Start Sync'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PASISyncDialog;