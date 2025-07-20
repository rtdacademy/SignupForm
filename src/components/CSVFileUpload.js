import React, { useState } from 'react';
import { Button } from "../components/ui/button";
import { Upload, Loader2, AlertTriangle } from 'lucide-react';
import Papa from 'papaparse';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "../components/ui/dialog";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";

/**
 * Reusable CSV file upload component that handles parsing, validation, and preview
 * 
 * @param {Object} props Component props
 * @param {string} props.buttonText Text to show on the upload button
 * @param {string} props.buttonVariant Button style variant ('default', 'outline', etc.)
 * @param {boolean} props.disabled Whether the upload button is disabled
 * @param {string} props.title Title for the preview dialog
 * @param {string} props.description Description for the preview dialog
 * @param {Array} props.requiredFields Array of field names that must be present in the CSV
 * @param {function} props.onDataProcessed Function called with the processed data before preview
 * @param {function} props.onConfirmUpload Function called when user confirms the upload
 * @param {function} props.renderPreview Custom function to render preview content
 * @param {boolean} props.showRowCount Whether to show row count in the preview
 * @param {Object} props.parseOptions Options to pass to Papa Parse
 * @returns {JSX.Element} The CSVFileUpload component
 */
const CSVFileUpload = ({
  buttonText = "Upload CSV",
  buttonVariant = "outline",
  disabled = false,
  title = "CSV Upload Preview",
  description = "Review the data before confirming the upload",
  requiredFields = [],
  onDataProcessed = null,
  onConfirmUpload,
  renderPreview = null,
  showRowCount = true,
  parseOptions = {}
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    // Reset the file input
    event.target.value = '';
    
    setIsProcessing(true);
    setError(null);
    setPreviewData(null);
    
    try {
      // Configure Papa Parse
      const config = {
        header: true,
        skipEmptyLines: 'greedy',
        complete: async (results) => {
          try {
            if (!results?.data?.length) {
              throw new Error('No valid data found in CSV file');
            }
          
            // Check if all required fields are present in the CSV headers
            if (requiredFields.length > 0) {
              const csvHeaders = Object.keys(results.data[0] || {});
              const missingFields = requiredFields.filter(field => !csvHeaders.includes(field));
              
              if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
              }
            }
          
            // Process the data if a processing function is provided
            let processedData = results.data;
            if (onDataProcessed) {
              try {
                processedData = await onDataProcessed(results.data);
              } catch (processingError) {
                throw new Error(`Error processing data: ${processingError.message}`);
              }
            }
          
            // Set the preview data and show the preview dialog
            setPreviewData({
              data: processedData,
              rowCount: results.data.length,
              originalData: results.data,
              file: file.name
            });
            setShowPreview(true);
          } catch (error) {
            console.error('Error processing CSV:', error);
            toast.error(error.message || 'Error processing CSV file');
            setError(error.message || 'Error processing CSV file');
          } finally {
            setIsProcessing(false);
          }
        },
        error: (error) => {
          console.error('Papa Parse error:', error);
          toast.error('Failed to parse CSV file');
          setError('Failed to parse CSV file');
          setIsProcessing(false);
        },
        ...parseOptions
      };
      
      // Parse the CSV file
      Papa.parse(file, config);
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error(error.message || 'Error reading file');
      setError(error.message || 'Error reading file');
      setIsProcessing(false);
    }
  };

  const handleConfirmUpload = async () => {
    if (!previewData || !onConfirmUpload) return;
    
    setIsUploading(true);
    setUploadProgress(10); // Start progress
    
    try {
      // Begin background progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const increment = Math.floor(Math.random() * 10) + 5;
          const newValue = Math.min(prev + increment, 90);
          return newValue;
        });
      }, 500);
      
      // Call the provided upload handler
      await onConfirmUpload(previewData);
      
      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Close the dialog
      setTimeout(() => {
        setShowPreview(false);
        setPreviewData(null);
        setUploadProgress(0);
      }, 500);
      
      toast.success('Upload completed successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to complete upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setShowPreview(false);
    setPreviewData(null);
    setUploadProgress(0);
  };

  return (
    <>
      <Button 
        variant={buttonVariant} 
        className="flex items-center gap-2"
        disabled={disabled || isProcessing}
      >
        {isProcessing ? 
          <Loader2 className="h-4 w-4 animate-spin" /> : 
          <Upload className="h-4 w-4" />
        }
        <label className="cursor-pointer">
          {isProcessing ? "Processing..." : buttonText}
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || isProcessing}
          />
        </label>
      </Button>
    
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={handleCancelUpload}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          
          {previewData && (
            <div className="py-4">
              {/* File info */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2">
                    {previewData.file}
                  </Badge>
                  {showRowCount && (
                    <span className="text-sm text-muted-foreground">
                      {previewData.rowCount} records found
                    </span>
                  )}
                </div>
              </div>
              
              {/* Custom preview renderer */}
              {renderPreview ? (
                renderPreview(previewData)
              ) : (
                <div className="max-h-[400px] overflow-y-auto border rounded-md p-4">
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(previewData.data.slice(0, 10), null, 2)}
                    {previewData.data.length > 10 && '...'}
                  </pre>
                </div>
              )}
              
              {/* Upload progress */}
              {isUploading && (
                <div className="mt-4 space-y-2">
                  <Progress value={uploadProgress} className="w-full h-2" />
                  <p className="text-xs text-center text-muted-foreground">
                    Processing... {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleCancelUpload}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </span>
              ) : (
                'Confirm Upload'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CSVFileUpload;